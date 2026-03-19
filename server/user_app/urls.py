from django.urls import path
from .views import Info, CreateUser, LogIn, LogOut

urlpatterns = [
    path("", Info.as_view(), name="user_info"),
    path("create/", CreateUser.as_view(), name="user_create"),
    path("login/", LogIn.as_view(), name="user_login"),
    path("logout/", LogOut.as_view(), name="user_logout"),
]