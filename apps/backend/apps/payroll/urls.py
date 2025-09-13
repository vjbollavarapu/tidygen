"""
Comprehensive payroll management URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PayrollConfigurationViewSet, PayrollComponentViewSet, EmployeePayrollProfileViewSet,
    PayrollRunViewSet, PayrollItemViewSet, PayrollAdjustmentViewSet,
    TaxYearViewSet, EmployeeTaxInfoViewSet, PayrollReportViewSet, PayrollAnalyticsViewSet,
    PayrollIntegrationViewSet, PayrollWebhookViewSet, PayrollNotificationViewSet,
    PayrollCalculationView, PayrollProcessingView, PayrollDashboardView
)

router = DefaultRouter()
# Payroll Configuration
router.register(r'configurations', PayrollConfigurationViewSet)
router.register(r'components', PayrollComponentViewSet)
router.register(r'employee-profiles', EmployeePayrollProfileViewSet)

# Enhanced Payroll
router.register(r'runs', PayrollRunViewSet)
router.register(r'items', PayrollItemViewSet)
router.register(r'adjustments', PayrollAdjustmentViewSet)

# Tax and Compliance
router.register(r'tax-years', TaxYearViewSet)
router.register(r'employee-tax-info', EmployeeTaxInfoViewSet)

# Reports and Analytics
router.register(r'reports', PayrollReportViewSet)
router.register(r'analytics', PayrollAnalyticsViewSet)

# Integrations
router.register(r'integrations', PayrollIntegrationViewSet)
router.register(r'webhooks', PayrollWebhookViewSet)

# Notifications
router.register(r'notifications', PayrollNotificationViewSet)

urlpatterns = [
    # API routes
    path('api/', include(router.urls)),
    
    # Payroll Operations
    path('api/calculate/', PayrollCalculationView.as_view(), name='payroll-calculate'),
    path('api/process/', PayrollProcessingView.as_view(), name='payroll-process'),
    
    # Dashboard
    path('api/dashboard/', PayrollDashboardView.as_view(), name='payroll-dashboard'),
]
