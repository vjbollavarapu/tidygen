"""
Comprehensive payroll management filters.
"""
import django_filters
from django.db.models import Q
from datetime import datetime, timedelta

from .models import (
    PayrollConfiguration, PayrollComponent, EmployeePayrollProfile,
    PayrollRun, PayrollItem, PayrollAdjustment, TaxYear, EmployeeTaxInfo,
    PayrollReport, PayrollAnalytics, PayrollIntegration, PayrollWebhook,
    PayrollNotification
)
from apps.hr.models import Employee, PayrollPeriod, Payroll


# ==================== PAYROLL CONFIGURATION FILTERS ====================

class PayrollConfigurationFilter(django_filters.FilterSet):
    """Filter for PayrollConfiguration model."""
    currency = django_filters.CharFilter(lookup_expr='icontains')
    pay_frequency = django_filters.ChoiceFilter(choices=PayrollConfiguration._meta.get_field('pay_frequency').choices)
    tax_year = django_filters.NumberFilter()
    federal_tax_rate_min = django_filters.NumberFilter(field_name='federal_tax_rate', lookup_expr='gte')
    federal_tax_rate_max = django_filters.NumberFilter(field_name='federal_tax_rate', lookup_expr='lte')
    overtime_multiplier_min = django_filters.NumberFilter(field_name='overtime_multiplier', lookup_expr='gte')
    overtime_multiplier_max = django_filters.NumberFilter(field_name='overtime_multiplier', lookup_expr='lte')
    auto_process_payroll = django_filters.BooleanFilter()
    require_approval = django_filters.BooleanFilter()
    allow_manual_adjustments = django_filters.BooleanFilter()
    
    class Meta:
        model = PayrollConfiguration
        fields = ['currency', 'pay_frequency', 'tax_year', 'auto_process_payroll', 'require_approval']


class PayrollComponentFilter(django_filters.FilterSet):
    """Filter for PayrollComponent model."""
    component_type = django_filters.ChoiceFilter(choices=PayrollComponent._meta.get_field('component_type').choices)
    calculation_type = django_filters.ChoiceFilter(choices=PayrollComponent._meta.get_field('calculation_type').choices)
    is_taxable = django_filters.BooleanFilter()
    is_pretax = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    is_mandatory = django_filters.BooleanFilter()
    category = django_filters.CharFilter(lookup_expr='icontains')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    percentage_min = django_filters.NumberFilter(field_name='percentage', lookup_expr='gte')
    percentage_max = django_filters.NumberFilter(field_name='percentage', lookup_expr='lte')
    sort_order_min = django_filters.NumberFilter(field_name='sort_order', lookup_expr='gte')
    sort_order_max = django_filters.NumberFilter(field_name='sort_order', lookup_expr='lte')
    
    class Meta:
        model = PayrollComponent
        fields = ['component_type', 'calculation_type', 'is_taxable', 'is_pretax', 'is_active', 'is_mandatory']


class EmployeePayrollProfileFilter(django_filters.FilterSet):
    """Filter for EmployeePayrollProfile model."""
    pay_type = django_filters.ChoiceFilter(choices=EmployeePayrollProfile._meta.get_field('pay_type').choices)
    is_active = django_filters.BooleanFilter()
    effective_date_after = django_filters.DateFilter(field_name='effective_date', lookup_expr='gte')
    effective_date_before = django_filters.DateFilter(field_name='effective_date', lookup_expr='lte')
    base_salary_min = django_filters.NumberFilter(field_name='base_salary', lookup_expr='gte')
    base_salary_max = django_filters.NumberFilter(field_name='base_salary', lookup_expr='lte')
    hourly_rate_min = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='gte')
    hourly_rate_max = django_filters.NumberFilter(field_name='hourly_rate', lookup_expr='lte')
    commission_rate_min = django_filters.NumberFilter(field_name='commission_rate', lookup_expr='gte')
    commission_rate_max = django_filters.NumberFilter(field_name='commission_rate', lookup_expr='lte')
    federal_exemptions_min = django_filters.NumberFilter(field_name='federal_exemptions', lookup_expr='gte')
    federal_exemptions_max = django_filters.NumberFilter(field_name='federal_exemptions', lookup_expr='lte')
    account_type = django_filters.ChoiceFilter(choices=EmployeePayrollProfile._meta.get_field('account_type').choices)
    
    class Meta:
        model = EmployeePayrollProfile
        fields = ['pay_type', 'is_active', 'account_type']


# ==================== ENHANCED PAYROLL FILTERS ====================

class PayrollRunFilter(django_filters.FilterSet):
    """Filter for PayrollRun model."""
    run_type = django_filters.ChoiceFilter(choices=PayrollRun._meta.get_field('run_type').choices)
    status = django_filters.ChoiceFilter(choices=PayrollRun._meta.get_field('status').choices)
    payroll_period = django_filters.ModelChoiceFilter(queryset=PayrollPeriod.objects.all())
    processed_by = django_filters.ModelChoiceFilter(queryset=PayrollRun.objects.values_list('processed_by', flat=True).distinct())
    approved_by = django_filters.ModelChoiceFilter(queryset=PayrollRun.objects.values_list('approved_by', flat=True).distinct())
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    processed_after = django_filters.DateTimeFilter(field_name='processed_at', lookup_expr='gte')
    processed_before = django_filters.DateTimeFilter(field_name='processed_at', lookup_expr='lte')
    approved_after = django_filters.DateTimeFilter(field_name='approved_at', lookup_expr='gte')
    approved_before = django_filters.DateTimeFilter(field_name='approved_at', lookup_expr='lte')
    total_employees_min = django_filters.NumberFilter(field_name='total_employees', lookup_expr='gte')
    total_employees_max = django_filters.NumberFilter(field_name='total_employees', lookup_expr='lte')
    total_gross_pay_min = django_filters.NumberFilter(field_name='total_gross_pay', lookup_expr='gte')
    total_gross_pay_max = django_filters.NumberFilter(field_name='total_gross_pay', lookup_expr='lte')
    total_net_pay_min = django_filters.NumberFilter(field_name='total_net_pay', lookup_expr='gte')
    total_net_pay_max = django_filters.NumberFilter(field_name='total_net_pay', lookup_expr='lte')
    total_taxes_min = django_filters.NumberFilter(field_name='total_taxes', lookup_expr='gte')
    total_taxes_max = django_filters.NumberFilter(field_name='total_taxes', lookup_expr='lte')
    
    class Meta:
        model = PayrollRun
        fields = ['run_type', 'status', 'payroll_period']


class PayrollItemFilter(django_filters.FilterSet):
    """Filter for PayrollItem model."""
    item_type = django_filters.ChoiceFilter(choices=PayrollItem._meta.get_field('item_type').choices)
    component = django_filters.ModelChoiceFilter(queryset=PayrollComponent.objects.all())
    payroll_run = django_filters.ModelChoiceFilter(queryset=PayrollRun.objects.all())
    is_taxable = django_filters.BooleanFilter()
    is_pretax = django_filters.BooleanFilter()
    quantity_min = django_filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    quantity_max = django_filters.NumberFilter(field_name='quantity', lookup_expr='lte')
    rate_min = django_filters.NumberFilter(field_name='rate', lookup_expr='gte')
    rate_max = django_filters.NumberFilter(field_name='rate', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = PayrollItem
        fields = ['item_type', 'component', 'payroll_run', 'is_taxable', 'is_pretax']


class PayrollAdjustmentFilter(django_filters.FilterSet):
    """Filter for PayrollAdjustment model."""
    adjustment_type = django_filters.ChoiceFilter(choices=PayrollAdjustment._meta.get_field('adjustment_type').choices)
    payroll_run = django_filters.ModelChoiceFilter(queryset=PayrollRun.objects.all())
    is_positive = django_filters.BooleanFilter()
    is_taxable = django_filters.BooleanFilter()
    is_pretax = django_filters.BooleanFilter()
    approved_by = django_filters.ModelChoiceFilter(queryset=PayrollAdjustment.objects.values_list('approved_by', flat=True).distinct())
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    approved_after = django_filters.DateTimeFilter(field_name='approved_at', lookup_expr='gte')
    approved_before = django_filters.DateTimeFilter(field_name='approved_at', lookup_expr='lte')
    is_approved = django_filters.BooleanFilter(method='filter_approved')
    
    class Meta:
        model = PayrollAdjustment
        fields = ['adjustment_type', 'payroll_run', 'is_positive', 'is_taxable', 'is_pretax', 'approved_by']
    
    def filter_approved(self, queryset, name, value):
        """Filter approved adjustments."""
        if value:
            return queryset.filter(approved_at__isnull=False)
        else:
            return queryset.filter(approved_at__isnull=True)


# ==================== TAX AND COMPLIANCE FILTERS ====================

class TaxYearFilter(django_filters.FilterSet):
    """Filter for TaxYear model."""
    year = django_filters.NumberFilter()
    is_active = django_filters.BooleanFilter()
    federal_tax_rate_min = django_filters.NumberFilter(field_name='federal_tax_rate', lookup_expr='gte')
    federal_tax_rate_max = django_filters.NumberFilter(field_name='federal_tax_rate', lookup_expr='lte')
    state_tax_rate_min = django_filters.NumberFilter(field_name='state_tax_rate', lookup_expr='gte')
    state_tax_rate_max = django_filters.NumberFilter(field_name='state_tax_rate', lookup_expr='lte')
    social_security_rate_min = django_filters.NumberFilter(field_name='social_security_rate', lookup_expr='gte')
    social_security_rate_max = django_filters.NumberFilter(field_name='social_security_rate', lookup_expr='lte')
    medicare_rate_min = django_filters.NumberFilter(field_name='medicare_rate', lookup_expr='gte')
    medicare_rate_max = django_filters.NumberFilter(field_name='medicare_rate', lookup_expr='lte')
    social_security_wage_base_min = django_filters.NumberFilter(field_name='social_security_wage_base', lookup_expr='gte')
    social_security_wage_base_max = django_filters.NumberFilter(field_name='social_security_wage_base', lookup_expr='lte')
    
    class Meta:
        model = TaxYear
        fields = ['year', 'is_active']


class EmployeeTaxInfoFilter(django_filters.FilterSet):
    """Filter for EmployeeTaxInfo model."""
    filing_status = django_filters.ChoiceFilter(choices=EmployeeTaxInfo._meta.get_field('filing_status').choices)
    tax_year = django_filters.ModelChoiceFilter(queryset=TaxYear.objects.all())
    federal_exemptions_min = django_filters.NumberFilter(field_name='federal_exemptions', lookup_expr='gte')
    federal_exemptions_max = django_filters.NumberFilter(field_name='federal_exemptions', lookup_expr='lte')
    state_exemptions_min = django_filters.NumberFilter(field_name='state_exemptions', lookup_expr='gte')
    state_exemptions_max = django_filters.NumberFilter(field_name='state_exemptions', lookup_expr='lte')
    additional_federal_withholding_min = django_filters.NumberFilter(field_name='additional_federal_withholding', lookup_expr='gte')
    additional_federal_withholding_max = django_filters.NumberFilter(field_name='additional_federal_withholding', lookup_expr='lte')
    additional_state_withholding_min = django_filters.NumberFilter(field_name='additional_state_withholding', lookup_expr='gte')
    additional_state_withholding_max = django_filters.NumberFilter(field_name='additional_state_withholding', lookup_expr='lte')
    ytd_gross_wages_min = django_filters.NumberFilter(field_name='ytd_gross_wages', lookup_expr='gte')
    ytd_gross_wages_max = django_filters.NumberFilter(field_name='ytd_gross_wages', lookup_expr='lte')
    ytd_federal_tax_min = django_filters.NumberFilter(field_name='ytd_federal_tax', lookup_expr='gte')
    ytd_federal_tax_max = django_filters.NumberFilter(field_name='ytd_federal_tax', lookup_expr='lte')
    ytd_state_tax_min = django_filters.NumberFilter(field_name='ytd_state_tax', lookup_expr='gte')
    ytd_state_tax_max = django_filters.NumberFilter(field_name='ytd_state_tax', lookup_expr='lte')
    ytd_social_security_min = django_filters.NumberFilter(field_name='ytd_social_security', lookup_expr='gte')
    ytd_social_security_max = django_filters.NumberFilter(field_name='ytd_social_security', lookup_expr='lte')
    ytd_medicare_min = django_filters.NumberFilter(field_name='ytd_medicare', lookup_expr='gte')
    ytd_medicare_max = django_filters.NumberFilter(field_name='ytd_medicare', lookup_expr='lte')
    w4_form_date_after = django_filters.DateFilter(field_name='w4_form_date', lookup_expr='gte')
    w4_form_date_before = django_filters.DateFilter(field_name='w4_form_date', lookup_expr='lte')
    state_tax_form_date_after = django_filters.DateFilter(field_name='state_tax_form_date', lookup_expr='gte')
    state_tax_form_date_before = django_filters.DateFilter(field_name='state_tax_form_date', lookup_expr='lte')
    
    class Meta:
        model = EmployeeTaxInfo
        fields = ['filing_status', 'tax_year']


# ==================== PAYROLL REPORTS AND ANALYTICS FILTERS ====================

class PayrollReportFilter(django_filters.FilterSet):
    """Filter for PayrollReport model."""
    report_type = django_filters.ChoiceFilter(choices=PayrollReport._meta.get_field('report_type').choices)
    status = django_filters.ChoiceFilter(choices=PayrollReport._meta.get_field('status').choices)
    generated_by = django_filters.ModelChoiceFilter(queryset=PayrollReport.objects.values_list('generated_by', flat=True).distinct())
    start_date_after = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_before = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_after = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_before = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    generated_after = django_filters.DateTimeFilter(field_name='generated_at', lookup_expr='gte')
    generated_before = django_filters.DateTimeFilter(field_name='generated_at', lookup_expr='lte')
    
    class Meta:
        model = PayrollReport
        fields = ['report_type', 'status', 'generated_by']


class PayrollAnalyticsFilter(django_filters.FilterSet):
    """Filter for PayrollAnalytics model."""
    period_type = django_filters.ChoiceFilter(choices=PayrollAnalytics._meta.get_field('period_type').choices)
    period_start_after = django_filters.DateFilter(field_name='period_start', lookup_expr='gte')
    period_start_before = django_filters.DateFilter(field_name='period_start', lookup_expr='lte')
    period_end_after = django_filters.DateFilter(field_name='period_end', lookup_expr='gte')
    period_end_before = django_filters.DateFilter(field_name='period_end', lookup_expr='lte')
    total_employees_min = django_filters.NumberFilter(field_name='total_employees', lookup_expr='gte')
    total_employees_max = django_filters.NumberFilter(field_name='total_employees', lookup_expr='lte')
    total_gross_pay_min = django_filters.NumberFilter(field_name='total_gross_pay', lookup_expr='gte')
    total_gross_pay_max = django_filters.NumberFilter(field_name='total_gross_pay', lookup_expr='lte')
    total_net_pay_min = django_filters.NumberFilter(field_name='total_net_pay', lookup_expr='gte')
    total_net_pay_max = django_filters.NumberFilter(field_name='total_net_pay', lookup_expr='lte')
    total_taxes_min = django_filters.NumberFilter(field_name='total_taxes', lookup_expr='gte')
    total_taxes_max = django_filters.NumberFilter(field_name='total_taxes', lookup_expr='lte')
    total_benefits_min = django_filters.NumberFilter(field_name='total_benefits', lookup_expr='gte')
    total_benefits_max = django_filters.NumberFilter(field_name='total_benefits', lookup_expr='lte')
    total_overtime_min = django_filters.NumberFilter(field_name='total_overtime', lookup_expr='gte')
    total_overtime_max = django_filters.NumberFilter(field_name='total_overtime', lookup_expr='lte')
    average_gross_pay_min = django_filters.NumberFilter(field_name='average_gross_pay', lookup_expr='gte')
    average_gross_pay_max = django_filters.NumberFilter(field_name='average_gross_pay', lookup_expr='lte')
    average_net_pay_min = django_filters.NumberFilter(field_name='average_net_pay', lookup_expr='gte')
    average_net_pay_max = django_filters.NumberFilter(field_name='average_net_pay', lookup_expr='lte')
    average_hours_worked_min = django_filters.NumberFilter(field_name='average_hours_worked', lookup_expr='gte')
    average_hours_worked_max = django_filters.NumberFilter(field_name='average_hours_worked', lookup_expr='lte')
    gross_pay_trend_min = django_filters.NumberFilter(field_name='gross_pay_trend', lookup_expr='gte')
    gross_pay_trend_max = django_filters.NumberFilter(field_name='gross_pay_trend', lookup_expr='lte')
    employee_count_trend_min = django_filters.NumberFilter(field_name='employee_count_trend', lookup_expr='gte')
    employee_count_trend_max = django_filters.NumberFilter(field_name='employee_count_trend', lookup_expr='lte')
    
    class Meta:
        model = PayrollAnalytics
        fields = ['period_type']


# ==================== PAYROLL INTEGRATION FILTERS ====================

class PayrollIntegrationFilter(django_filters.FilterSet):
    """Filter for PayrollIntegration model."""
    integration_type = django_filters.ChoiceFilter(choices=PayrollIntegration._meta.get_field('integration_type').choices)
    is_active = django_filters.BooleanFilter()
    sync_status = django_filters.ChoiceFilter(choices=PayrollIntegration._meta.get_field('sync_status').choices)
    provider_name = django_filters.CharFilter(lookup_expr='icontains')
    last_sync_after = django_filters.DateTimeFilter(field_name='last_sync', lookup_expr='gte')
    last_sync_before = django_filters.DateTimeFilter(field_name='last_sync', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    
    class Meta:
        model = PayrollIntegration
        fields = ['integration_type', 'is_active', 'sync_status']


class PayrollWebhookFilter(django_filters.FilterSet):
    """Filter for PayrollWebhook model."""
    event_type = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    integration = django_filters.ModelChoiceFilter(queryset=PayrollIntegration.objects.all())
    total_calls_min = django_filters.NumberFilter(field_name='total_calls', lookup_expr='gte')
    total_calls_max = django_filters.NumberFilter(field_name='total_calls', lookup_expr='lte')
    successful_calls_min = django_filters.NumberFilter(field_name='successful_calls', lookup_expr='gte')
    successful_calls_max = django_filters.NumberFilter(field_name='successful_calls', lookup_expr='lte')
    failed_calls_min = django_filters.NumberFilter(field_name='failed_calls', lookup_expr='gte')
    failed_calls_max = django_filters.NumberFilter(field_name='failed_calls', lookup_expr='lte')
    last_called_after = django_filters.DateTimeFilter(field_name='last_called', lookup_expr='gte')
    last_called_before = django_filters.DateTimeFilter(field_name='last_called', lookup_expr='lte')
    success_rate_min = django_filters.NumberFilter(method='filter_success_rate_min')
    success_rate_max = django_filters.NumberFilter(method='filter_success_rate_max')
    
    class Meta:
        model = PayrollWebhook
        fields = ['event_type', 'is_active', 'integration']
    
    def filter_success_rate_min(self, queryset, name, value):
        """Filter by minimum success rate."""
        return queryset.extra(
            where=['(successful_calls::float / NULLIF(total_calls, 0)) >= %s'],
            params=[value]
        )
    
    def filter_success_rate_max(self, queryset, name, value):
        """Filter by maximum success rate."""
        return queryset.extra(
            where=['(successful_calls::float / NULLIF(total_calls, 0)) <= %s'],
            params=[value]
        )


# ==================== PAYROLL NOTIFICATIONS FILTERS ====================

class PayrollNotificationFilter(django_filters.FilterSet):
    """Filter for PayrollNotification model."""
    notification_type = django_filters.ChoiceFilter(choices=PayrollNotification._meta.get_field('notification_type').choices)
    status = django_filters.ChoiceFilter(choices=PayrollNotification._meta.get_field('status').choices)
    delivery_method = django_filters.ChoiceFilter(choices=PayrollNotification._meta.get_field('delivery_method').choices)
    scheduled_after = django_filters.DateTimeFilter(field_name='scheduled_at', lookup_expr='gte')
    scheduled_before = django_filters.DateTimeFilter(field_name='scheduled_at', lookup_expr='lte')
    sent_after = django_filters.DateTimeFilter(field_name='sent_at', lookup_expr='gte')
    sent_before = django_filters.DateTimeFilter(field_name='sent_at', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created', lookup_expr='lte')
    related_payroll = django_filters.ModelChoiceFilter(queryset=Payroll.objects.all())
    related_payroll_run = django_filters.ModelChoiceFilter(queryset=PayrollRun.objects.all())
    is_scheduled = django_filters.BooleanFilter(method='filter_scheduled')
    is_sent = django_filters.BooleanFilter(method='filter_sent')
    
    class Meta:
        model = PayrollNotification
        fields = ['notification_type', 'status', 'delivery_method', 'related_payroll', 'related_payroll_run']
    
    def filter_scheduled(self, queryset, name, value):
        """Filter scheduled notifications."""
        if value:
            return queryset.filter(scheduled_at__isnull=False)
        else:
            return queryset.filter(scheduled_at__isnull=True)
    
    def filter_sent(self, queryset, name, value):
        """Filter sent notifications."""
        if value:
            return queryset.filter(sent_at__isnull=False)
        else:
            return queryset.filter(sent_at__isnull=True)


# ==================== ADVANCED PAYROLL FILTERS ====================

class PayrollAdvancedFilter(django_filters.FilterSet):
    """Advanced filter for payroll analytics and reporting."""
    date_range = django_filters.ChoiceFilter(
        choices=[
            ('today', 'Today'),
            ('yesterday', 'Yesterday'),
            ('this_week', 'This Week'),
            ('last_week', 'Last Week'),
            ('this_month', 'This Month'),
            ('last_month', 'Last Month'),
            ('this_quarter', 'This Quarter'),
            ('last_quarter', 'Last Quarter'),
            ('this_year', 'This Year'),
            ('last_year', 'Last Year'),
            ('custom', 'Custom Range'),
        ],
        method='filter_date_range'
    )
    start_date = django_filters.DateFilter()
    end_date = django_filters.DateFilter()
    department_ids = django_filters.BaseInFilter(field_name='employee__department', lookup_expr='in')
    employee_ids = django_filters.BaseInFilter(field_name='employee', lookup_expr='in')
    payroll_period_ids = django_filters.BaseInFilter(field_name='payroll_period', lookup_expr='in')
    pay_type = django_filters.ChoiceFilter(choices=EmployeePayrollProfile._meta.get_field('pay_type').choices)
    employment_status = django_filters.ChoiceFilter(choices=Employee._meta.get_field('employment_status').choices)
    min_gross_pay = django_filters.NumberFilter(field_name='gross_pay', lookup_expr='gte')
    max_gross_pay = django_filters.NumberFilter(field_name='gross_pay', lookup_expr='lte')
    min_net_pay = django_filters.NumberFilter(field_name='net_pay', lookup_expr='gte')
    max_net_pay = django_filters.NumberFilter(field_name='net_pay', lookup_expr='lte')
    has_overtime = django_filters.BooleanFilter(method='filter_has_overtime')
    has_adjustments = django_filters.BooleanFilter(method='filter_has_adjustments')
    
    class Meta:
        model = Payroll
        fields = ['status']
    
    def filter_date_range(self, queryset, name, value):
        """Filter by date range."""
        from django.utils import timezone
        now = timezone.now().date()
        
        if value == 'today':
            return queryset.filter(payroll_period__start_date__lte=now, payroll_period__end_date__gte=now)
        elif value == 'yesterday':
            yesterday = now - timedelta(days=1)
            return queryset.filter(payroll_period__start_date__lte=yesterday, payroll_period__end_date__gte=yesterday)
        elif value == 'this_week':
            start_of_week = now - timedelta(days=now.weekday())
            return queryset.filter(payroll_period__start_date__gte=start_of_week)
        elif value == 'last_week':
            start_of_last_week = now - timedelta(days=now.weekday() + 7)
            end_of_last_week = start_of_last_week + timedelta(days=6)
            return queryset.filter(payroll_period__start_date__gte=start_of_last_week, payroll_period__end_date__lte=end_of_last_week)
        elif value == 'this_month':
            return queryset.filter(payroll_period__start_date__year=now.year, payroll_period__start_date__month=now.month)
        elif value == 'last_month':
            last_month = now.month - 1 if now.month > 1 else 12
            last_year = now.year if now.month > 1 else now.year - 1
            return queryset.filter(payroll_period__start_date__year=last_year, payroll_period__start_date__month=last_month)
        elif value == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = (quarter - 1) * 3 + 1
            return queryset.filter(payroll_period__start_date__year=now.year, payroll_period__start_date__month__gte=start_month, payroll_period__start_date__month__lt=start_month + 3)
        elif value == 'last_quarter':
            quarter = (now.month - 1) // 3 + 1
            last_quarter = quarter - 1 if quarter > 1 else 4
            last_year = now.year if quarter > 1 else now.year - 1
            start_month = (last_quarter - 1) * 3 + 1
            return queryset.filter(payroll_period__start_date__year=last_year, payroll_period__start_date__month__gte=start_month, payroll_period__start_date__month__lt=start_month + 3)
        elif value == 'this_year':
            return queryset.filter(payroll_period__start_date__year=now.year)
        elif value == 'last_year':
            return queryset.filter(payroll_period__start_date__year=now.year - 1)
        elif value == 'custom':
            start_date = self.data.get('start_date')
            end_date = self.data.get('end_date')
            if start_date and end_date:
                return queryset.filter(payroll_period__start_date__gte=start_date, payroll_period__end_date__lte=end_date)
        
        return queryset
    
    def filter_has_overtime(self, queryset, name, value):
        """Filter payrolls with overtime."""
        if value:
            return queryset.filter(overtime_hours__gt=0)
        else:
            return queryset.filter(overtime_hours=0)
    
    def filter_has_adjustments(self, queryset, name, value):
        """Filter payrolls with adjustments."""
        if value:
            return queryset.filter(adjustments__isnull=False).distinct()
        else:
            return queryset.filter(adjustments__isnull=True)


class PayrollRunAdvancedFilter(django_filters.FilterSet):
    """Advanced filter for payroll runs."""
    date_range = django_filters.ChoiceFilter(
        choices=[
            ('today', 'Today'),
            ('yesterday', 'Yesterday'),
            ('this_week', 'This Week'),
            ('last_week', 'Last Week'),
            ('this_month', 'This Month'),
            ('last_month', 'Last Month'),
            ('this_quarter', 'This Quarter'),
            ('last_quarter', 'Last Quarter'),
            ('this_year', 'This Year'),
            ('last_year', 'Last Year'),
            ('custom', 'Custom Range'),
        ],
        method='filter_date_range'
    )
    start_date = django_filters.DateFilter()
    end_date = django_filters.DateFilter()
    min_total_employees = django_filters.NumberFilter(field_name='total_employees', lookup_expr='gte')
    max_total_employees = django_filters.NumberFilter(field_name='total_employees', lookup_expr='lte')
    min_total_gross_pay = django_filters.NumberFilter(field_name='total_gross_pay', lookup_expr='gte')
    max_total_gross_pay = django_filters.NumberFilter(field_name='total_gross_pay', lookup_expr='lte')
    min_total_net_pay = django_filters.NumberFilter(field_name='total_net_pay', lookup_expr='gte')
    max_total_net_pay = django_filters.NumberFilter(field_name='total_net_pay', lookup_expr='lte')
    has_errors = django_filters.BooleanFilter(method='filter_has_errors')
    is_overdue = django_filters.BooleanFilter(method='filter_is_overdue')
    
    class Meta:
        model = PayrollRun
        fields = ['run_type', 'status']
    
    def filter_date_range(self, queryset, name, value):
        """Filter by date range."""
        from django.utils import timezone
        now = timezone.now().date()
        
        if value == 'today':
            return queryset.filter(created__date=now)
        elif value == 'yesterday':
            yesterday = now - timedelta(days=1)
            return queryset.filter(created__date=yesterday)
        elif value == 'this_week':
            start_of_week = now - timedelta(days=now.weekday())
            return queryset.filter(created__date__gte=start_of_week)
        elif value == 'last_week':
            start_of_last_week = now - timedelta(days=now.weekday() + 7)
            end_of_last_week = start_of_last_week + timedelta(days=6)
            return queryset.filter(created__date__range=[start_of_last_week, end_of_last_week])
        elif value == 'this_month':
            return queryset.filter(created__year=now.year, created__month=now.month)
        elif value == 'last_month':
            last_month = now.month - 1 if now.month > 1 else 12
            last_year = now.year if now.month > 1 else now.year - 1
            return queryset.filter(created__year=last_year, created__month=last_month)
        elif value == 'this_quarter':
            quarter = (now.month - 1) // 3 + 1
            start_month = (quarter - 1) * 3 + 1
            return queryset.filter(created__year=now.year, created__month__gte=start_month, created__month__lt=start_month + 3)
        elif value == 'last_quarter':
            quarter = (now.month - 1) // 3 + 1
            last_quarter = quarter - 1 if quarter > 1 else 4
            last_year = now.year if quarter > 1 else now.year - 1
            start_month = (last_quarter - 1) * 3 + 1
            return queryset.filter(created__year=last_year, created__month__gte=start_month, created__month__lt=start_month + 3)
        elif value == 'this_year':
            return queryset.filter(created__year=now.year)
        elif value == 'last_year':
            return queryset.filter(created__year=now.year - 1)
        elif value == 'custom':
            start_date = self.data.get('start_date')
            end_date = self.data.get('end_date')
            if start_date and end_date:
                return queryset.filter(created__date__range=[start_date, end_date])
        
        return queryset
    
    def filter_has_errors(self, queryset, name, value):
        """Filter runs with errors."""
        if value:
            return queryset.exclude(error_log=[])
        else:
            return queryset.filter(error_log=[])
    
    def filter_is_overdue(self, queryset, name, value):
        """Filter overdue runs."""
        from django.utils import timezone
        now = timezone.now().date()
        
        if value:
            return queryset.filter(
                payroll_period__pay_date__lt=now,
                status__in=['draft', 'processing', 'review']
            )
        else:
            return queryset.exclude(
                payroll_period__pay_date__lt=now,
                status__in=['draft', 'processing', 'review']
            )
