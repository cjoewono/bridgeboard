from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
from .models import Task
from .serializers import TaskSerializer


class UserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class AllTasks(UserView):
    def get(self, request):
        job_id = request.query_params.get('job_id')
        if job_id:
            job = get_object_or_404(request.user.jobs, id=job_id)
            tasks = TaskSerializer(job.tasks.all(), many=True)
        else:
            user_jobs = request.user.jobs.all()
            tasks = TaskSerializer(Task.objects.filter(job__in=user_jobs), many=True)
        return Response(tasks.data)

    def post(self, request):
        data = request.data.copy()
        job_id = data.get('job')
        get_object_or_404(request.user.jobs, id=job_id)
        ser_task = TaskSerializer(data=data)
        if ser_task.is_valid():
            ser_task.save()
            return Response(ser_task.data, status=s.HTTP_201_CREATED)
        else:
            return Response(ser_task.errors, status=s.HTTP_400_BAD_REQUEST)


class ATask(UserView):
    def get_a_task(self, request, task_id):
        user_jobs = request.user.jobs.all()
        return get_object_or_404(Task, id=task_id, job__in=user_jobs)

    def get(self, request, task_id):
        task = self.get_a_task(request, task_id)
        return Response(TaskSerializer(task).data)

    def put(self, request, task_id):
        task = self.get_a_task(request, task_id)
        ser_task = TaskSerializer(task, data=request.data, partial=True)
        if ser_task.is_valid():
            ser_task.save()
            return Response(ser_task.data)
        else:
            return Response(ser_task.errors, status=s.HTTP_400_BAD_REQUEST)

    def delete(self, request, task_id):
        task = self.get_a_task(request, task_id)
        task_title = task.title
        task.delete()
        return Response(f"{task_title} has been deleted")