from rest_framework.serializers import ModelSerializer
from .models import InterviewNote

class InterviewNoteSerializer(ModelSerializer):
    class Meta:
        model=InterviewNote
        fields='__all__'
        