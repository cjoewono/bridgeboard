from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as s
from .models import Contact
from .serializers import ContactSerializer


class UserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]


class AllContacts(UserView):
    def get(self, request):
        contacts = ContactSerializer(request.user.contacts.all(), many=True)
        return Response(contacts.data)

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id
        ser_contact = ContactSerializer(data=data)
        if ser_contact.is_valid():
            ser_contact.save()
            return Response(ser_contact.data, status=s.HTTP_201_CREATED)
        else:
            return Response(ser_contact.errors, status=s.HTTP_400_BAD_REQUEST)


class AContact(UserView):
    def get_a_contact(self, request, contact_id):
        return get_object_or_404(request.user.contacts, id=contact_id)

    def get(self, request, contact_id):
        contact = self.get_a_contact(request, contact_id)
        return Response(ContactSerializer(contact).data)

    def put(self, request, contact_id):
        contact = self.get_a_contact(request, contact_id)
        ser_contact = ContactSerializer(contact, data=request.data, partial=True)
        if ser_contact.is_valid():
            ser_contact.save()
            return Response(ser_contact.data)
        else:
            return Response(ser_contact.errors, status=s.HTTP_400_BAD_REQUEST)

    def delete(self, request, contact_id):
        contact = self.get_a_contact(request, contact_id)
        contact_name = contact.name
        contact.delete()
        return Response(f"{contact_name} has been deleted")