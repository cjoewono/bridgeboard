from django.urls import path
from .views import AllTasks, ATask

urlpatterns = [
    path("", AllTasks.as_view(), name="all_tasks"),
    path("<int:task_id>/", ATask.as_view(), name="a_task"),
]