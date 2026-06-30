from django.urls import path
from . import views

urlpatterns = [
    # Público
    path('orders', views.OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:code>', views.OrderQueryView.as_view(), name='order-query'),
    # Admin
    path('admin/orders', views.OrderAdminListView.as_view(), name='order-admin-list'),
    path('admin/orders/<int:pk>', views.OrderAdminDetailView.as_view(), name='order-admin-detail'),
]
