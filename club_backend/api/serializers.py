from rest_framework import serializers
from .models import ClubModel, ApplicantModel, ApplicationFormModel, ApplicationQuestionModel, ApplicationSubmissionModel, ApplicationAnswerModel
ApplicationQuestionModel, ApplicationAnswerModel
from django.contrib.auth.models import User

from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubModel
        fields = ['name', 'club_id', 'id']

class ApplicationFormQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationQuestionModel
        fields = [
            "id", "form", "prompt", "question_type", "required"
        ]
        read_only_fields = ["id", "created_at"]

class ApplicationFormSerializer(serializers.ModelSerializer):
    questions = ApplicationFormQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ApplicationFormModel
        fields = [
            "id", "club", "title", "created_at",
            "updated_at", "questions",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "questions"]

class ApplicationAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationAnswerModel
        fields = ["id", "submission", "question", "answer_text", "answer_file"]
        read_only_fields = ["id", "updated_at"]

class ApplicationSubmissionSerializer(serializers.ModelSerializer):
    answers = ApplicationAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = ApplicationSubmissionModel
        fields = [
            "id", "form", "applicant", "answers",
        ]
        read_only_fields = ["id", "answers"]

class ApplicantSerializer(serializers.ModelSerializer):
    application_id = serializers.IntegerField(source="application.id", read_only=True)
    submission = ApplicationSubmissionSerializer(read_only=True)
    
    class Meta:
        model = ApplicantModel
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'year', 
            'pass_apps', 
            'pass_first', 
            'pass_second', 
            'club_association', 
            'application_id', 
            'submission'
        ]
        read_only_fields = ['pass_apps','pass_first','pass_second']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
