from django.urls import path
from .views import AllNotes, ANote

urlpatterns = [
    path("", AllNotes.as_view(), name="all_notes"),
    path("<int:note_id>/", ANote.as_view(), name="a_note"),
]