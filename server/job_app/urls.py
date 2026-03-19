from django.urls import path
from .views import AllJobs, AJob

urlpatterns = [
    path("", AllJobs.as_view(), name="all_jobs"),
    path("<int:job_id>/", AJob.as_view(), name="a_job"),
]