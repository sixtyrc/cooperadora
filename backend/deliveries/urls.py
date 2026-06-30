from django.urls import path
from . import views

urlpatterns = [
    # Admin
    path('admin/deliveries', views.DeliveryAdminListCreateView.as_view(), name='delivery-admin-list'),
    path('admin/deliveries/<int:pk>', views.DeliveryAdminDetailView.as_view(), name='delivery-admin-detail'),
]
