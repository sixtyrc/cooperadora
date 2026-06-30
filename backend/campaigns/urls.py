from django.urls import path
from . import views

urlpatterns = [
    # Públicas
    path('campaigns', views.CampaignListPublicView.as_view(), name='campaign-list'),
    path('campaigns/<slug:slug>', views.CampaignDetailPublicView.as_view(), name='campaign-detail'),
    # Admin
    path('admin/campaigns', views.CampaignAdminListCreateView.as_view(), name='campaign-admin-list'),
    path('admin/campaigns/<int:pk>', views.CampaignAdminDetailView.as_view(), name='campaign-admin-detail'),
]
