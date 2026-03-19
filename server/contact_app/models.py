from django.db import models
from user_app.models import AppUser

class Contact(models.Model):
    user=models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='contacts')
    name=models.CharField(max_length=200)
    company=models.CharField(max_length=200, blank=True, null=True)
    email=models.EmailField(blank=True, null=True)
    notes=models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name