from django.urls import path
from .views import AllContacts, AContact

urlpatterns = [
    path("", AllContacts.as_view(), name="all_contacts"),
    path("<int:contact_id>/", AContact.as_view(), name="a_contact"),
]