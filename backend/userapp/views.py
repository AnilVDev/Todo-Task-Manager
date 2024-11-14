from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from rest_framework.exceptions import PermissionDenied

class UserSignUpView(GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data = request.data)
        if serializer.is_valid():
            user = serializer.save()  # Save the new user
            return Response({   
                "message": "User created successfully.",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error' : 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username= username).first()

        if user:
            if user.check_password(password):        
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                return Response({
                    'access_token': str(access_token),
                    'refresh_token': str(refresh)
                }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
    

class ProjectCreateListView(ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)    
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user) 
    
    def delete(self, request, *args, **kwargs):
        project = self.get_object()
        id = project.id
        self.perform_destroy(project)

        return Response({'id': id}, status=status.HTTP_200_OK)
    
class TodoCreateListView(ListCreateAPIView):
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user
        if not Project.objects.filter(id=project_id, user=user).exists():
            raise PermissionDenied("You are not authorized to view todos for this project.")
        return Todo.objects.filter(project_id=project_id, project__user=user)

    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        serializer.save(project_id=project_id)

class TodoDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        user = self.request.user

        if not Project.objects.filter(id=project_id, user=user).exists():
            raise PermissionDenied("You are not authorized to access this todo.")        
        return Todo.objects.filter(project_id=project_id)
           