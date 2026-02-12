from django.shortcuts import render
from django.contrib.auth.models import User
from .models import ClubModel, ApplicantModel, ApplicationFormModel, ApplicationQuestionModel, ApplicationSubmissionModel, ApplicationAnswerModel
from django.shortcuts import get_object_or_404
from .serializers import ClubSerializer, ApplicantSerializer, ApplicationFormQuestionSerializer, ApplicationFormSerializer, ApplicationAnswerSerializer, ApplicationSubmissionSerializer, UserSerializer
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, JSONParser, MultiPartParser, FormParser
from rest_framework import generics, permissions
from .serializers import RegisterSerializer
from rest_framework.views import APIView

class UserView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class ApplicationView(viewsets.ModelViewSet):
    serializer_class = ApplicationFormSerializer
    # Admins must be authenticated to modify, but anyone can read
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Limit applications to those belonging to the logged-in user's club.
        """
        user = self.request.user
        club = getattr(getattr(user, "profile", None), "club", None)
        if club is None:
            return ApplicationFormModel.objects.all()
        return ApplicationFormModel.objects.filter(club=club)

class ClubView(viewsets.ModelViewSet):
    serializer_class = ClubSerializer
    # Base queryset required so DRF router can infer a basename
    queryset = ClubModel.objects.all()
    # Admins must be authenticated to modify, but anyone can read
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        For unauthenticated users (e.g. during registration), return all clubs
        so they can choose an association.

        For authenticated users, limit to the club attached to their profile.
        """
        user = self.request.user
        if not user.is_authenticated:
            return ClubModel.objects.all()
        club = getattr(getattr(user, "profile", None), "club", None)
        if club is None:
            return ClubModel.objects.none()
        return ClubModel.objects.filter(pk=club.pk)

class QuestionView(viewsets.ModelViewSet):
    queryset = ApplicationQuestionModel.objects.all()
    serializer_class = ApplicationFormQuestionSerializer
    # Admins must be authenticated to modify, but anyone can read questions
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ApplicantView(viewsets.ModelViewSet):
    serializer_class = ApplicantSerializer
    # Base queryset required so DRF router can infer a basename
    queryset = ApplicantModel.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['first_name', 'last_name', 'year']
    ordering = ['first_name']

    def get_queryset(self):
        user = self.request.user
        club = getattr(getattr(user, "profile", None), "club", None)
        if club is None:
            return ApplicantModel.objects.none()
        return ApplicantModel.objects.filter(club_association=club)

class ApplicantsCreateView(generics.CreateAPIView):
    queryset = ApplicantModel.objects.all()
    serializer_class = ApplicantSerializer
    # Allow JSON (from frontend), as well as form/multipart
    parser_classes = [JSONParser, MultiPartParser, FormParser]

class ApplicantSubmissionView(viewsets.ModelViewSet):
    serializer_class = ApplicationSubmissionSerializer
    queryset = ApplicationSubmissionModel.objects.all()

class ApplicantAnswerView(viewsets.ModelViewSet):
    serializer_class = ApplicationAnswerSerializer
    queryset = ApplicationAnswerModel.objects.all()
    parser_classes = [JSONParser, MultiPartParser, FormParser]
