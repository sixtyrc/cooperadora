from django.urls import path
from . import views

urlpatterns = [
    path('auth/login', views.LoginView.as_view(), name='login'),
    path('auth/logout', views.LogoutView.as_view(), name='logout'),
    path('auth/me', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/csrf', views.CsrfTokenView.as_view(), name='csrf-token'),
]
