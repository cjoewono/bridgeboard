from django.urls import path
from .views import TranslateView, JobSearchView

urlpatterns = [
    path("translate/", TranslateView.as_view(), name="translate"),
    path("adzuna/search/", JobSearchView.as_view(), name="job-search"),
]
