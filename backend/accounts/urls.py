from django.urls import path
from . import views
from .views_admin import UserAdminListCreateView, UserAdminDetailView, AuditLogListView

urlpatterns = [
    path('auth/login', views.LoginView.as_view(), name='login'),
    path('auth/logout', views.LogoutView.as_view(), name='logout'),
    path('auth/me', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/csrf', views.CsrfTokenView.as_view(), name='csrf-token'),
    path('admin/users', UserAdminListCreateView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>', UserAdminDetailView.as_view(), name='admin-user-detail'),
    path('admin/audit', AuditLogListView.as_view(), name='admin-audit'),
]
