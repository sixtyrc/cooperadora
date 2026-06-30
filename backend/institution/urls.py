from django.urls import path
from . import views

urlpatterns = [
    path('institution', views.InstitutionView.as_view(), name='institution-detail'),
]
