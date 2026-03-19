from django.db import models
from user_app.models import AppUser

class Job(models.Model):
    user=models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='jobs')
    company=models.CharField(max_length=200)
    title=models.CharField(max_length=200)
    status=models.CharField(max_length=20, default='saved')
    
    def __str__(self):
        return f"{self.title} at {self.company}"