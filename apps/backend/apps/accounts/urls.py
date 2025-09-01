"""
Accounts URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, UserProfileViewSet, UserRegistrationView, UserLoginView,
    PasswordResetRequestView, PasswordResetConfirmView, EmailVerificationView,
    UserSessionViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'sessions', UserSessionViewSet)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Password management
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # Email verification
    path('email-verify/', EmailVerificationView.as_view(), name='email-verify'),
    
    # User management
    path('', include(router.urls)),
]
