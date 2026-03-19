from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
from .models import Job
from .serializers import JobSerializer

class UserView(APIView):
    authentication_classes=[TokenAuthentication]
    permission_classes=[IsAuthenticated]
    
class AllJobs(UserView):
    def get(self,request):
        jobs=JobSerializer(request.user.jobs.all(),many=True)
        return Response(jobs.data)
    
    def post(self,request):
        data=request.data.copy()
        data['user']=request.user.id
        ser_job=JobSerializer(data=data)
        if ser_job.is_valid():
            ser_job.save()
            return Response(ser_job.data,status=s.HTTP_201_CREATED)
        else:
            return Response(ser_job.errors, status=s.HTTP_400_BAD_REQUEST)
        
class AJob(UserView):
    def get_a_job(self,request,job_id):
        return get_object_or_404(request.user.jobs,id=job_id)
    
    def get(self,request,job_id):
        job=self.get_a_job(request,job_id)
        return Response(JobSerializer(job).data)
    
    def put(self,request,job_id):
        job=self.get_a_job(request,job_id)
        ser_job=JobSerializer(job,data=request.data,partial=True)
        if ser_job.is_valid():
            ser_job.save()
            return Response(ser_job.data)
        else:
            return Response(ser_job.errors, status=s.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,job_id):
        job=self.get_a_job(request,job_id)
        job_title=f"{job.title} at {job.company}"
        job.delete()
        return Response(f"{job_title} has been deleted")