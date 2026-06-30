from django.urls import path
from . import views

urlpatterns = [
    # Público
    path('campaigns/<slug:slug>/products', views.ProductPublicByCampaignView.as_view(), name='product-list'),
    # Admin
    path('admin/products', views.ProductAdminListCreateView.as_view(), name='product-admin-list'),
    path('admin/products/<int:pk>', views.ProductAdminDetailView.as_view(), name='product-admin-detail'),
]
