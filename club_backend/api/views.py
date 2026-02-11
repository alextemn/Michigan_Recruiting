from django.shortcuts import render
from django.contrib.auth.models import User
from .models import ClubModel, ApplicantModel, ApplicationFormModel, ApplicationQuestionModel, ApplicationSubmissionModel, ApplicationAnswerModel
from django.shortcuts import get_object_or_404
from .serializers import ClubSerializer, ApplicantSerializer, ApplicationFormQuestionSerializer, ApplicationFormSerializer, ApplicationAnswerSerializer, ApplicationSubmissionSerializer, UserSerializer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, JSONParser, MultiPartParser, FormParser
from rest_framework import generics, permissions
from .serializers import RegisterSerializer
from rest_framework.views import APIView

class UserView(generics.ListAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ApplicationView(viewsets.ModelViewSet):
    serializer_class = ApplicationFormSerializer
    queryset = ApplicationFormModel.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class ClubView(viewsets.ModelViewSet):
    serializer_class = ClubSerializer
    queryset = ClubModel.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class QuestionView(viewsets.ModelViewSet):
    serializer_class = ApplicationFormQuestionSerializer
    queryset = ApplicationQuestionModel.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class ApplicantView(viewsets.ModelViewSet):
    serializer_class = ApplicantSerializer
    queryset = ApplicantModel.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class ApplicantsCreateView(generics.CreateAPIView):
    queryset = ApplicantModel.objects.all()
    serializer_class = ApplicantSerializer
    parser_classes = [MultiPartParser, FormParser]

class ApplicantSubmissionView(viewsets.ModelViewSet):
    serializer_class = ApplicationSubmissionSerializer
    queryset = ApplicationSubmissionModel.objects.all()

class ApplicantAnswerView(viewsets.ModelViewSet):
    serializer_class = ApplicationAnswerSerializer
    queryset = ApplicationAnswerModel.objects.all()
