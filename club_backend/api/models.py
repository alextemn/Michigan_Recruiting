from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import CASCADE

class ClubModel(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class ApplicationFormModel(models.Model):
    club = models.ForeignKey(ClubModel, on_delete=CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.title

class ApplicantModel(models.Model):
    YEARS = [
        (1, 'Freshman'), (2, 'Sophomore'), (3, 'Junior'), (4, 'Senior'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    year = models.CharField(max_length=100, choices=YEARS)
    pass_apps = models.BooleanField(default=False)
    pass_first = models.BooleanField(default=False)
    pass_second = models.BooleanField(default=False)
    club_association = models.ForeignKey(ClubModel, on_delete=CASCADE)
    application = models.ForeignKey(ApplicationFormModel, on_delete=CASCADE, null=True, blank=True)

    def __str__(self):
        return self.first_name + " " + self.last_name

class ProfileModel(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile", 
    )
    club = models.ForeignKey(
        ClubModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )
class ApplicationQuestionModel(models.Model):
    TYPE_CHOICES = [
        ('Short', 'SHORT'), ('Long', 'LONG'), ('Multi-Select', 'MULTI-SELECT'), ('File', 'FILE')
    ]
    form = models.ForeignKey(ApplicationFormModel, on_delete=CASCADE, related_name="questions")
    question_type = models.CharField(max_length=100, choices = TYPE_CHOICES)
    prompt = models.CharField(max_length=100)
    required = models.BooleanField(default=True)

    def __str__(self):
        return self.prompt

class ApplicationSubmissionModel(models.Model):
    # Use string-based choices so the default is valid
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Submitted', 'Submitted'),
    ]
    form = models.ForeignKey(ApplicationFormModel, on_delete=CASCADE)
    applicant = models.OneToOneField(ApplicantModel, on_delete=CASCADE, related_name="submission")
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='Draft')


    class Meta:
        unique_together = ['form', 'applicant']
    
    def __str__(self):
        return self.applicant.first_name + " " + self.applicant.last_name + " " + self.status

class ApplicationAnswerModel(models.Model):
    submission = models.ForeignKey(ApplicationSubmissionModel, on_delete=CASCADE, related_name="answers")
    question = models.ForeignKey(ApplicationQuestionModel, on_delete=CASCADE)

    answer_text = models.TextField(blank=True, null=True)
    answer_file = models.FileField(upload_to="answers/", blank=True, null=True)

    class Meta:
        unique_together = ['submission', 'question']

    def clean(self):
        qt = self.question.question_type
        if qt == 'Short' and (self.answer_text is None or len(self.answer_text) > 1000):
            raise ValidationError("Short answer must be <= 1000 characters.")
        if qt == 'File' and not self.answer_file:
            raise ValidationError("File answer required.")
        if qt != 'File' and not self.answer_text:
            raise ValidationError("Text answer required.")

    def __str__(self):
        return f"Answer to {self.question_id}"
