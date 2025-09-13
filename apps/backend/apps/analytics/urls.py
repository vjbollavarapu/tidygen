"""
Analytics & Reporting URL configuration.

This module defines all the URL patterns for the analytics and reporting system,
including reports, KPIs, dashboards, and analytics components.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.analytics.views import (
    ReportViewSet, KPIViewSet, KPIMeasurementViewSet,
    DashboardViewSet, DashboardWidgetViewSet,
    DataSourceViewSet, ReportTemplateViewSet,
    AnalyticsEventViewSet, AlertViewSet,
    AnalyticsQueryView, AnalyticsDashboardView
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'kpis', KPIViewSet, basename='kpi')
router.register(r'kpi-measurements', KPIMeasurementViewSet, basename='kpimeasurement')
router.register(r'dashboards', DashboardViewSet, basename='dashboard')
router.register(r'dashboard-widgets', DashboardWidgetViewSet, basename='dashboardwidget')
router.register(r'data-sources', DataSourceViewSet, basename='datasource')
router.register(r'report-templates', ReportTemplateViewSet, basename='reporttemplate')
router.register(r'events', AnalyticsEventViewSet, basename='analyticsevent')
router.register(r'alerts', AlertViewSet, basename='alert')

urlpatterns = [
    # Include all router URLs
    path('', include(router.urls)),
    
    # Additional API views
    path('query/', AnalyticsQueryView.as_view(), name='analytics-query'),
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]
