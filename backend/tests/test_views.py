from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from django.urls import reverse
from userapp.models import Project, Todo
from rest_framework_simplejwt.tokens import RefreshToken


class UserSignupViewTest(APITestCase):
    def setUp(self):
        self.signup_url = reverse('user-signup')
        self.valid_user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepassword"
        }
        self.invalid_user_data = {
            "username": "",
            "email": "invalidemail",
            "password": "123"
        }

    def test_user_signup_valid_data(self):
        """Test signing up with valid user data"""
        response = self.client.post(self.signup_url, self.valid_user_data)   
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data) 
        self.assertEqual(response.data["message"],"User created successfully.")    
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], self.valid_user_data["username"])
        self.assertEqual(response.data["user"]["email"], self.valid_user_data["email"])
        self.assertTrue(User.objects.filter(username=self.valid_user_data["username"]).exists())

    def test_user_signup_invalid_data(self):
        """Test signing up with valid user data"""
        response = self.client.post(self.signup_url, self.invalid_user_data)   
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)
        self.assertIn("email", response.data)
        self.assertFalse(User.objects.filter(email=self.invalid_user_data["email"]).exists())  

class UserLoginViewTest(APITestCase):
    def setUp(self):
        self.login_url = reverse('user-login')  
        self.user = User.objects.create_user(
            username='testuser',
            password='securepassword'
        )
        self.valid_credentials = {
            'username': 'testuser',
            'password': 'securepassword'
        }
        self.invalid_credentials = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        self.missing_credentials = {
            'username': '',
            'password': ''
        }              

    def test_login_with_valid_credentials(self):
        """Test login with valid credentials."""
        response = self.client.post(self.login_url, self.valid_credentials)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)   

    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials."""
        response = self.client.post(self.login_url, self.invalid_credentials)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], "Invalid Credentials")

    def test_login_with_missing_credentials(self):
        """Test login with missing credentials."""
        response = self.client.post(self.login_url, self.missing_credentials)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], "Username and password are required")

class ProjectTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.other_user = User.objects.create_user(username='otheruser', password='otherpassword')
        self.authenticate()
        self.project_url = reverse('project-list-create')
        self.project_detail_url = lambda pk: reverse('project-detail', kwargs={'pk': pk})
        
        self.client.login(username='testuser', password='testpassword')
        self.project_data = {'title': 'Test Project'}
        self.project = Project.objects.create(
            title='Existing Project', user=self.user
        )

    def authenticate(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')    

    def test_create_project(self):
        """Test creating a project."""
        response = self.client.post(self.project_url, self.project_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], self.project_data['title'])
        self.assertEqual(response.data['user'], self.user.id)

    def test_list_projects(self):
        """Test listing projects for the authenticated user."""
        response = self.client.get(self.project_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], self.project.title)

    def test_project_detail(self):
        """Test retrieving a single project."""
        response = self.client.get(self.project_detail_url(self.project.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.project.title)

    def test_update_project(self):
        """Test updating a project."""
        updated_data = {'title': 'Updated Project'}
        response = self.client.put(self.project_detail_url(self.project.id), updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.title, updated_data['title'])

    def test_delete_project(self):
        """Test deleting a project."""
        response = self.client.delete(self.project_detail_url(self.project.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.project.id)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())

    def test_project_permission(self):
        """Test that users cannot access projects of other users."""
        refresh = RefreshToken.for_user(self.other_user) 
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')          
        response = self.client.get(self.project_detail_url(self.project.id))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)



class TodoViewsTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.project = Project.objects.create(title="Test Project", user=self.user)

        self.other_user = User.objects.create_user(username="otheruser", password="password123")
        self.other_project = Project.objects.create(title="Other Project", user=self.other_user)

        self.todo = Todo.objects.create(description="Test Todo", project=self.project)

        # Obtain a valid JWT token for the user
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

        # Define URLs
        self.create_url = reverse("todo-list-create", kwargs={"project_id": self.project.id})
        self.detail_url = reverse("todo-detail", kwargs={"project_id": self.project.id, "pk": self.todo.id})

        # Data for creating a todo
        self.valid_data = {"description": "New Todo"}
        self.invalid_data = {"description": "Test Todo"}  #

    def test_create_todo_success(self):
        """Test creating a todo for an authorized project."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post(self.create_url, self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["description"], self.valid_data["description"])

    def test_create_todo_unauthorized_project(self):
        """Test creating a todo for a project that the user doesn't own."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        url = reverse("todo-list-create", kwargs={"project_id": self.other_project.id})
        response = self.client.post(url, self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)

    def test_create_todo_unauthenticated(self):
        """Test creating a todo without authentication."""
        response = self.client.post(self.create_url, self.valid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_todo_duplicate_description(self):
        """Test validation for duplicate todo descriptions."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.post(self.create_url, self.invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("description", response.data)

    def test_access_todo_success(self):
        """Test retrieving a specific todo."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], self.todo.description)

    def test_access_todo_unauthorized(self):
        """Test accessing a todo that does not belong to the user."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")
        other_todo = Todo.objects.create(description="Other User's Todo", project=self.other_project)
        url = reverse("todo-detail", kwargs={"project_id": self.other_project.id, "pk": other_todo.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("detail", response.data)

    def test_access_todo_unauthenticated(self):
        """Test accessing a todo without authentication."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
