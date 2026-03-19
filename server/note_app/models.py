from django.db import models
from job_app.models import Job

class InterviewNote(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='notes')
    content=models.TextField()
    interview_date=models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"Note for {self.job.company}"