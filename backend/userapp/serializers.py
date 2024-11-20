from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Project, Todo
from django.contrib.auth.models import AnonymousUser

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only' : True}}

    def create(self, validated_data):
        user = User(
            username = validated_data['username'],
            email = validated_data['email'],
        )
        user.set_password(validated_data['password']) 
        user.save()       
        return user 

# Serializer for JWT Token    
class TokenSerializer(serializers.Serializer):
    refresh_Token = serializers.CharField()

    def validate(self, data):
        try:
            refresh = RefreshToken(data['refresh_Token'])
            access_token = refresh.access_token
            return {'access_token' : str(access_token), 'refresh_token': str(refresh)}
        except Exception as e:
            raise serializers.ValidationError({"refresh_Token": "Invalid refresh token."})
        

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project      
        fields = ['id', 'title', 'created_at', 'user', 'custom_id']
        read_only_fields = ['id', 'created_at', 'custom_id', 'user']  

    def validate_title(self, value):
        user = self.context['request'].user
        if user.is_anonymous:
            raise serializers.ValidationError("User must be authenticated.")
        if Project.objects.filter(title=value, user= user).exists():
            raise serializers.ValidationError('A project with this title already exists.')
        return value
    

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'description', 'status', 'created_at','updated_at', 'project', 'custom_id']
        read_only_fields = ['id', 'created_at', 'custom_id', 'project']

    def validate_description(self, value):
        project_id = self.context['view'].kwargs.get('project_id')
        user = self.context['request'].user
        if isinstance(user, AnonymousUser):
            raise serializers.ValidationError("User must be authenticated.")

        try:
            project = Project.objects.get(id=project_id, user=user)
        except Project.DoesNotExist:
            raise serializers.ValidationError("You are not associated with this project.")

        current_instance_id = self.instance.id if self.instance else None
        if Todo.objects.filter(description=value, project=project).exclude(id=current_instance_id).exists():
            raise serializers.ValidationError("A todo with this description already exists in the project.")
        return value 
    

    

