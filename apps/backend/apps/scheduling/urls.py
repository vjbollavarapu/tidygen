"""
URL configuration for scheduling management.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ScheduleTemplateViewSet, ResourceViewSet, TeamViewSet, TeamMemberViewSet,
    AppointmentViewSet, ScheduleConflictViewSet, ScheduleRuleViewSet,
    ScheduleNotificationViewSet, ScheduleAnalyticsViewSet, ScheduleIntegrationViewSet,
    SchedulingDashboardView, SchedulingSummaryView
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'schedule-templates', ScheduleTemplateViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'conflicts', ScheduleConflictViewSet)
router.register(r'rules', ScheduleRuleViewSet)
router.register(r'notifications', ScheduleNotificationViewSet)
router.register(r'analytics', ScheduleAnalyticsViewSet)
router.register(r'integrations', ScheduleIntegrationViewSet)

app_name = 'scheduling'

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Dashboard and summary views
    path('api/dashboard/', SchedulingDashboardView.as_view(), name='dashboard'),
    path('api/summary/', SchedulingSummaryView.as_view(), name='summary'),
]
