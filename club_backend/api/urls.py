from django.contrib import admin
from django.urls import path, include
from .views import ApplicationView, ClubView, QuestionView, ApplicantView, ApplicantAnswerView, ApplicantSubmissionView, RegisterView, UserView, ApplicantsCreateView
from rest_framework_nested import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

""" Valid endpoint:
/club/{id}/application/{id}/applicant/{id}
/club{id}/application{id}/question/{id}
/submission/{id}/answers
/applicants/{id}
"""

router = routers.DefaultRouter(trailing_slash=False)
router.register('club', ClubView)
router.register('submission', ApplicantSubmissionView)
router.register('applicant', ApplicantView)

club_router = routers.NestedSimpleRouter(router, 'club', lookup='club')
club_router.register('application', ApplicationView, basename='club-applications')

app_router = routers.NestedSimpleRouter(club_router, 'application', lookup='application')
app_router.register('applicant', ApplicantView, basename='application-applicants')

question_router = routers.NestedSimpleRouter(club_router, 'application', lookup='application')
question_router.register('question', QuestionView, basename='application-questions')

submission_router = routers.NestedSimpleRouter(router, 'submission', lookup='submission')
submission_router.register('answer', ApplicantAnswerView, basename='submission-answers')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(club_router.urls)),
    path('', include(app_router.urls)),
    path('', include(submission_router.urls)),
    path('', include(question_router.urls)),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    #path('users/', UserView.as_view(), name='user-view'),
    path("users/", UserView.as_view(), name="user-detail"),
    path('applicants/', ApplicantsCreateView.as_view(), name='applicant-creation')
]

urlpatterns += [
    path("register/", RegisterView.as_view(), name="register"),
]