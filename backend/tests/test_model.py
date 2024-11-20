from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from userapp.models import Project, Todo 


class ProjectModelTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="123456")
        self.project = Project.objects.create(title="Test Project", user=self.user) 

    def test_project_creation(self):
        """Test project is created successfully and custom_id is generated"""
        self.assertEqual(self.project.title,"Test Project")
        self.assertTrue(self.project.custom_id.startswith("PROJ-"))
        self.assertEqual(len(self.project.custom_id),9)    

    def test_project_custom_id_generation(self):
        """Test sequential custom_id generation for projects"""
        project2 = Project.objects.create(title="Another Project", user=self.user)
        self.assertEqual(project2.custom_id, "PROJ-0002")

    def test_project_string_representation(self):
        """Test the string representation of the project""" 
        self.assertEqual(str(self.project),"Test Project")

    def test_project_user_relationship(self):
        """Test projects belongs to the correct user"""
        self.assertEqual(self.project.user, self.user)


class TodoModelTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.project = Project.objects.create(title="Test Project", user=self.user)
        self.todo = Todo.objects.create(description="Test Todo", project=self.project)

    def test_todo_creation(self):
        """Test todo is created successfully and custom_id is generated"""
        self.assertEqual(self.todo.description, "Test Todo")
        self.assertTrue(self.todo.custom_id.startswith("TODO-"))
        self.assertEqual(len(self.todo.custom_id), 9)

    def test_todo_custom_id_generation(self):
        """Test sequential custom_id generation for todos"""
        todo2 = Todo.objects.create(description="Another Todo", project=self.project)
        self.assertEqual(todo2.custom_id, "TODO-0002")

    def test_todo_string_representation(self):
        """Test the string representation of the todo"""
        self.assertEqual(str(self.todo), "Test Todo")

    def test_todo_project_relationship(self):
        """Test todo belongs to the correct project"""
        self.assertEqual(self.todo.project, self.project)

    def test_todo_status_default(self):
        """Test default status of a todo is False"""
        self.assertFalse(self.todo.status)
