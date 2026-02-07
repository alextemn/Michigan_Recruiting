from django.shortcuts import render
from django.contrib.auth.models import User
from .models import ClubModel, ApplicantModel, ApplicationFormModel, ApplicationQuestionModel, ApplicationSubmissionModel, ApplicationAnswerModel
from django.shortcuts import get_object_or_404
from .serializers import ClubSerializer, ApplicantSerializer, ApplicationFormQuestionSerializer, ApplicationFormSerializer, ApplicationAnswerSerializer, ApplicationSubmissionSerializer
from rest_framework import viewsets
from rest_framework.response import Response

class ApplicationView(viewsets.ModelViewSet):
    serializer_class = ApplicationFormSerializer
    queryset = ApplicationFormModel.objects.all()

class ClubView(viewsets.ModelViewSet):
    serializer_class = ClubSerializer
    queryset = ClubModel.objects.all()

class QuestionView(viewsets.ModelViewSet):
    serializer_class = ApplicationFormQuestionSerializer
    queryset = ApplicationQuestionModel.objects.all()

class ApplicantView(viewsets.ModelViewSet):
    serializer_class = ApplicantSerializer
    queryset = ApplicantModel.objects.all()

class ApplicantSubmissionView(viewsets.ModelViewSet):
    serializer_class = ApplicationSubmissionSerializer
    queryset = ApplicationSubmissionModel.objects.all()

class ApplicantAnswerView(viewsets.ModelViewSet):
    serializer_class = ApplicationAnswerSerializer
    queryset = ApplicationAnswerModel.objects.all()