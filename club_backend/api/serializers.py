from rest_framework import serializers
from .models import ClubModel, ApplicantModel, ApplicationFormModel, ApplicationQuestionModel, ApplicationSubmissionModel, ApplicationAnswerModel
ApplicationQuestionModel, ApplicationAnswerModel

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
        fields = fields = [
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