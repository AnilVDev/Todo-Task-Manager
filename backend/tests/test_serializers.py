from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from userapp.models import Project, Todo
from userapp.serializers import (
    UserSerializer,
    TokenSerializer,
    ProjectSerializer,
    TodoSerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.request import Request
import uuid
from userapp.views import TodoCreateListView


class UserSerializerTest(APITestCase):
    def setUp(self):
        self.valid_data = {
            "username": "testuser",
            "email": "testuser@123.com",
            "password": "123456"
        }

    def test_user_serializer_create(self):
        """Test creating a new user"""
        serializer = UserSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, "testuser")
        self.assertTrue(user.check_password("123456"))    

    def test_user_serializer_invalid_email(self):
        """Test invalid email format."""
        invalid_data = self.valid_data.copy()
        invalid_data["email"] = "invalid-email"
        serializer = UserSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)


class TokenSerializerTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123456")
        refresh = RefreshToken.for_user(self.user)
        self.valid_data = {"refresh_Token": str(refresh)}

    def test_token_serializer_valid(self):
        """Test valid refresh token."""
        serializer = TokenSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        tokens = serializer.validated_data
        self.assertIn("access_token", tokens)
        self.assertIn("refresh_token", tokens)

    def test_token_serializer_invalid(self):
        """Test invalid refresh token."""
        invalid_data = {"refresh_Token": "invalidtoken"}
        serializer = TokenSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("refresh_Token", serializer.errors)
        self.assertEqual(serializer.errors["refresh_Token"][0], "Invalid refresh token.")

class ProjectSerializerTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.project = Project.objects.create(title="Test Project", user=self.user)
        self.valid_data = {"title": "New Project"}

    def test_project_serializer_create(self):
        """Test creating a new project."""
        # Authenticate the user with the force_authenticate method
        self.client.force_authenticate(user=self.user)
        
        # Create a mock request
        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = self.user  
        
        serializer = ProjectSerializer(data=self.valid_data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        project = serializer.save(user=self.user)
        self.assertEqual(project.title, "New Project")

    def test_project_serializer_duplicate_title(self):
        """Test validation for duplicate project titles."""
        self.client.force_authenticate(user=self.user)
        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = self.user  
        
        serializer = ProjectSerializer(data={"title": "Test Project"}, context={"request": request})
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    @staticmethod
    def _mock_request(user):
        """Mock request with user for serializer context."""
        factory = APIRequestFactory()
        request = factory.get("/")
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        request.user = user
        return Request(request)


class TodoSerializerTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.project = Project.objects.create(title="Test Project", user=self.user)
        self.todo = Todo.objects.create(description="Test Todo", project=self.project)
        self.valid_data = {"description": "New Todo"}

    def test_todo_serializer_create(self):
        """Test creating a new todo."""
        user = User.objects.create_user(username=f'testuser_{uuid.uuid4()}', password='testpass')
        self.client.login(username='testuser', password='testpass')

        project = Project.objects.create(title="Test Project", user=user)

        factory = APIRequestFactory()
        request = factory.post('/todos/', {'description': 'Test Todo', 'project': project.id})
        request.user = user

        # Create the view mock
        view = TodoCreateListView()
        view.request = request
        view.kwargs = {'project_id': project.id}

        serializer = TodoSerializer(data={'description': 'Test Todo', 'project': project.id}, context={'view': view, 'request': request})

        self.assertTrue(serializer.is_valid())


    def test_todo_serializer_duplicate_description(self):
        """Test validation for duplicate todo descriptions within a project."""
        serializer = TodoSerializer(data={"description": "Test Todo"}, context={"view": self._mock_view(self.project), "request": self._mock_request(self.user)})
        self.assertFalse(serializer.is_valid())
        self.assertIn("description", serializer.errors)

    def test_todo_serializer_invalid_project(self):
        """Test validation for unauthorized access to a project."""
        another_user = User.objects.create_user(username="anotheruser", password="password123")
        serializer = TodoSerializer(data=self.valid_data, context={"view": self._mock_view(self.project), "request": self._mock_request(another_user)})
        self.assertFalse(serializer.is_valid())
        self.assertIn("description", serializer.errors)

    @staticmethod
    def _mock_request(user):
        """Mock request with user for serializer context."""
        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = user
        return Request(request)

    @staticmethod
    def _mock_view(project):
        """Mock view with kwargs for serializer context."""
        view = APIRequestFactory().get("/")
        view.kwargs = {"project_id": project.id}
        return view


