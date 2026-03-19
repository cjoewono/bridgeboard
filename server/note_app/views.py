from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
from .models import InterviewNote
from .serializers import InterviewNoteSerializer


class UserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class AllNotes(UserView):
    def get(self, request):
        job_id = request.query_params.get('job_id')
        if job_id:
            job = get_object_or_404(request.user.jobs, id=job_id)
            notes = InterviewNoteSerializer(job.notes.all(), many=True)
        else:
            user_jobs = request.user.jobs.all()
            notes = InterviewNoteSerializer(
                InterviewNote.objects.filter(job__in=user_jobs), many=True
            )
        return Response(notes.data)

    def post(self, request):
        data = request.data.copy()
        job_id = data.get('job')
        get_object_or_404(request.user.jobs, id=job_id)
        ser_note = InterviewNoteSerializer(data=data)
        if ser_note.is_valid():
            ser_note.save()
            return Response(ser_note.data, status=s.HTTP_201_CREATED)
        else:
            return Response(ser_note.errors, status=s.HTTP_400_BAD_REQUEST)


class ANote(UserView):
    def get_a_note(self, request, note_id):
        user_jobs = request.user.jobs.all()
        return get_object_or_404(InterviewNote, id=note_id, job__in=user_jobs)

    def get(self, request, note_id):
        note = self.get_a_note(request, note_id)
        return Response(InterviewNoteSerializer(note).data)

    def put(self, request, note_id):
        note = self.get_a_note(request, note_id)
        ser_note = InterviewNoteSerializer(note, data=request.data, partial=True)
        if ser_note.is_valid():
            ser_note.save()
            return Response(ser_note.data)
        else:
            return Response(ser_note.errors, status=s.HTTP_400_BAD_REQUEST)

    def delete(self, request, note_id):
        note = self.get_a_note(request, note_id)
        note.delete()
        return Response("Interview note has been deleted")