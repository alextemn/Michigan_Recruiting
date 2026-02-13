from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import ApplicationFormModel, ApplicationQuestionModel


def touch_application_form(form):
    """Update the application's updated_at (e.g. when questions are added or changed)."""
    if form:
        form.save(update_fields=["updated_at"])


@receiver(post_save, sender=ApplicationQuestionModel)
def question_saved(sender, instance, **kwargs):
    if instance.form_id:
        touch_application_form(instance.form)


@receiver(post_delete, sender=ApplicationQuestionModel)
def question_deleted(sender, instance, **kwargs):
    form_id = getattr(instance, "form_id", None)
    if form_id:
        form = ApplicationFormModel.objects.filter(pk=form_id).first()
        touch_application_form(form)
