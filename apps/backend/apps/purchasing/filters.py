"""
Purchasing Management Filters

This module contains all the filters for the purchasing management system,
providing advanced data querying capabilities for purchase orders, suppliers, procurement, and analytics.
"""

import django_filters
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta

from apps.purchasing.models import (
    PurchaseOrder, PurchaseOrderItem, PurchaseReceipt, PurchaseReceiptItem,
    ProcurementRequest, ProcurementRequestItem, SupplierPerformance, PurchaseAnalytics
)
from apps.inventory.models import Supplier, Product


class PurchaseOrderFilter(django_filters.FilterSet):
    """Filter for purchase orders."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Status and priority filters
    status = django_filters.ChoiceFilter(choices=PurchaseOrder.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=PurchaseOrder.PRIORITY_CHOICES)
    
    # Date filters
    order_date_from = django_filters.DateTimeFilter(field_name='order_date', lookup_expr='gte')
    order_date_to = django_filters.DateTimeFilter(field_name='order_date', lookup_expr='lte')
    expected_delivery_date_from = django_filters.DateTimeFilter(field_name='expected_delivery_date', lookup_expr='gte')
    expected_delivery_date_to = django_filters.DateTimeFilter(field_name='expected_delivery_date', lookup_expr='lte')
    
    # Financial filters
    total_amount_min = django_filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_amount_max = django_filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    # Related filters
    supplier = django_filters.ModelChoiceFilter(queryset=Supplier.objects.all())
    requested_by = django_filters.NumberFilter(field_name='requested_by__id')
    approved_by = django_filters.NumberFilter(field_name='approved_by__id')
    
    # Special filters
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    pending_approval = django_filters.BooleanFilter(method='filter_pending_approval')
    
    class Meta:
        model = PurchaseOrder
        fields = {
            'po_number': ['exact', 'icontains'],
            'reference_number': ['exact', 'icontains'],
            'tracking_number': ['exact', 'icontains'],
        }
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(po_number__icontains=value) |
            Q(supplier__name__icontains=value) |
            Q(reference_number__icontains=value) |
            Q(notes__icontains=value) |
            Q(supplier_notes__icontains=value)
        )
    
    def filter_overdue(self, queryset, name, value):
        """Filter for overdue purchase orders."""
        if value:
            return queryset.filter(
                expected_delivery_date__lt=timezone.now(),
                status__in=['sent', 'partially_received']
            )
        return queryset
    
    def filter_pending_approval(self, queryset, name, value):
        """Filter for purchase orders pending approval."""
        if value:
            return queryset.filter(status='pending_approval')
        return queryset


class PurchaseOrderItemFilter(django_filters.FilterSet):
    """Filter for purchase order items."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Product filters
    product = django_filters.ModelChoiceFilter(queryset=Product.objects.all())
    product_name = django_filters.CharFilter(field_name='product_name', lookup_expr='icontains')
    product_sku = django_filters.CharFilter(field_name='product_sku', lookup_expr='icontains')
    
    # Quantity filters
    quantity_ordered_min = django_filters.NumberFilter(field_name='quantity_ordered', lookup_expr='gte')
    quantity_ordered_max = django_filters.NumberFilter(field_name='quantity_ordered', lookup_expr='lte')
    quantity_received_min = django_filters.NumberFilter(field_name='quantity_received', lookup_expr='gte')
    quantity_received_max = django_filters.NumberFilter(field_name='quantity_received', lookup_expr='lte')
    
    # Price filters
    unit_price_min = django_filters.NumberFilter(field_name='unit_price', lookup_expr='gte')
    unit_price_max = django_filters.NumberFilter(field_name='unit_price', lookup_expr='lte')
    total_price_min = django_filters.NumberFilter(field_name='total_price', lookup_expr='gte')
    total_price_max = django_filters.NumberFilter(field_name='total_price', lookup_expr='lte')
    
    # Date filters
    expected_delivery_date_from = django_filters.DateTimeFilter(field_name='expected_delivery_date', lookup_expr='gte')
    expected_delivery_date_to = django_filters.DateTimeFilter(field_name='expected_delivery_date', lookup_expr='lte')
    
    # Special filters
    fully_received = django_filters.BooleanFilter(method='filter_fully_received')
    partially_received = django_filters.BooleanFilter(method='filter_partially_received')
    not_received = django_filters.BooleanFilter(method='filter_not_received')
    
    class Meta:
        model = PurchaseOrderItem
        fields = {
            'purchase_order__po_number': ['exact', 'icontains'],
            'purchase_order__status': ['exact'],
        }
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(product_name__icontains=value) |
            Q(product_sku__icontains=value) |
            Q(product_description__icontains=value) |
            Q(notes__icontains=value)
        )
    
    def filter_fully_received(self, queryset, name, value):
        """Filter for fully received items."""
        if value:
            return queryset.filter(quantity_received__gte=F('quantity_ordered'))
        return queryset
    
    def filter_partially_received(self, queryset, name, value):
        """Filter for partially received items."""
        if value:
            return queryset.filter(
                quantity_received__gt=0,
                quantity_received__lt=F('quantity_ordered')
            )
        return queryset
    
    def filter_not_received(self, queryset, name, value):
        """Filter for items not yet received."""
        if value:
            return queryset.filter(quantity_received=0)
        return queryset


class PurchaseReceiptFilter(django_filters.FilterSet):
    """Filter for purchase receipts."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Status filter
    status = django_filters.ChoiceFilter(choices=PurchaseReceipt.STATUS_CHOICES)
    
    # Date filters
    receipt_date_from = django_filters.DateTimeFilter(field_name='receipt_date', lookup_expr='gte')
    receipt_date_to = django_filters.DateTimeFilter(field_name='receipt_date', lookup_expr='lte')
    
    # Related filters
    purchase_order = django_filters.NumberFilter(field_name='purchase_order__id')
    purchase_order_number = django_filters.CharFilter(field_name='purchase_order__po_number', lookup_expr='icontains')
    received_by = django_filters.NumberFilter(field_name='received_by__id')
    
    class Meta:
        model = PurchaseReceipt
        fields = {
            'receipt_number': ['exact', 'icontains'],
        }
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(receipt_number__icontains=value) |
            Q(purchase_order__po_number__icontains=value) |
            Q(notes__icontains=value) |
            Q(condition_notes__icontains=value)
        )


class PurchaseReceiptItemFilter(django_filters.FilterSet):
    """Filter for purchase receipt items."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Condition filter
    condition = django_filters.CharFilter(field_name='condition', lookup_expr='icontains')
    
    # Quantity filters
    quantity_received_min = django_filters.NumberFilter(field_name='quantity_received', lookup_expr='gte')
    quantity_received_max = django_filters.NumberFilter(field_name='quantity_received', lookup_expr='lte')
    
    # Date filters
    expiry_date_from = django_filters.DateTimeFilter(field_name='expiry_date', lookup_expr='gte')
    expiry_date_to = django_filters.DateTimeFilter(field_name='expiry_date', lookup_expr='lte')
    
    # Related filters
    receipt = django_filters.NumberFilter(field_name='receipt__id')
    purchase_order_item = django_filters.NumberFilter(field_name='purchase_order_item__id')
    
    class Meta:
        model = PurchaseReceiptItem
        fields = {
            'batch_number': ['exact', 'icontains'],
        }
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(purchase_order_item__product_name__icontains=value) |
            Q(purchase_order_item__product_sku__icontains=value) |
            Q(notes__icontains=value) |
            Q(batch_number__icontains=value)
        )


class ProcurementRequestFilter(django_filters.FilterSet):
    """Filter for procurement requests."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Status and priority filters
    status = django_filters.ChoiceFilter(choices=ProcurementRequest.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=ProcurementRequest.PRIORITY_CHOICES)
    
    # Date filters
    request_date_from = django_filters.DateTimeFilter(field_name='request_date', lookup_expr='gte')
    request_date_to = django_filters.DateTimeFilter(field_name='request_date', lookup_expr='lte')
    required_date_from = django_filters.DateTimeFilter(field_name='required_date', lookup_expr='gte')
    required_date_to = django_filters.DateTimeFilter(field_name='required_date', lookup_expr='lte')
    
    # Financial filters
    estimated_cost_min = django_filters.NumberFilter(field_name='estimated_cost', lookup_expr='gte')
    estimated_cost_max = django_filters.NumberFilter(field_name='estimated_cost', lookup_expr='lte')
    
    # Related filters
    requested_by = django_filters.NumberFilter(field_name='requested_by__id')
    reviewed_by = django_filters.NumberFilter(field_name='reviewed_by__id')
    
    # Special filters
    urgent = django_filters.BooleanFilter(method='filter_urgent')
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    
    class Meta:
        model = ProcurementRequest
        fields = {
            'request_number': ['exact', 'icontains'],
            'title': ['exact', 'icontains'],
            'budget_code': ['exact', 'icontains'],
        }
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(request_number__icontains=value) |
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(justification__icontains=value) |
            Q(notes__icontains=value)
        )
    
    def filter_urgent(self, queryset, name, value):
        """Filter for urgent requests."""
        if value:
            return queryset.filter(priority='urgent')
        return queryset
    
    def filter_overdue(self, queryset, name, value):
        """Filter for overdue requests."""
        if value:
            return queryset.filter(
                required_date__lt=timezone.now(),
                status__in=['draft', 'submitted', 'under_review']
            )
        return queryset


class ProcurementRequestItemFilter(django_filters.FilterSet):
    """Filter for procurement request items."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Product filters
    product = django_filters.ModelChoiceFilter(queryset=Product.objects.all())
    product_name = django_filters.CharFilter(field_name='product_name', lookup_expr='icontains')
    product_sku = django_filters.CharFilter(field_name='product_sku', lookup_expr='icontains')
    
    # Quantity filters
    quantity_min = django_filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    quantity_max = django_filters.NumberFilter(field_name='quantity', lookup_expr='lte')
    
    # Price filters
    estimated_unit_price_min = django_filters.NumberFilter(field_name='estimated_unit_price', lookup_expr='gte')
    estimated_unit_price_max = django_filters.NumberFilter(field_name='estimated_unit_price', lookup_expr='lte')
    estimated_total_price_min = django_filters.NumberFilter(field_name='estimated_total_price', lookup_expr='gte')
    estimated_total_price_max = django_filters.NumberFilter(field_name='estimated_total_price', lookup_expr='lte')
    
    class Meta:
        model = ProcurementRequestItem
        fields = {
            'request__request_number': ['exact', 'icontains'],
            'request__status': ['exact'],
        }
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(product_name__icontains=value) |
            Q(product_sku__icontains=value) |
            Q(product_description__icontains=value) |
            Q(notes__icontains=value) |
            Q(specifications__icontains=value)
        )


class SupplierPerformanceFilter(django_filters.FilterSet):
    """Filter for supplier performance records."""
    
    # Text search
    search = django_filters.CharFilter(method='filter_search')
    
    # Rating filters
    overall_rating_min = django_filters.NumberFilter(field_name='overall_rating', lookup_expr='gte')
    overall_rating_max = django_filters.NumberFilter(field_name='overall_rating', lookup_expr='lte')
    quality_rating_min = django_filters.NumberFilter(field_name='quality_rating', lookup_expr='gte')
    quality_rating_max = django_filters.NumberFilter(field_name='quality_rating', lookup_expr='lte')
    communication_rating_min = django_filters.NumberFilter(field_name='communication_rating', lookup_expr='gte')
    communication_rating_max = django_filters.NumberFilter(field_name='communication_rating', lookup_expr='lte')
    price_competitiveness_min = django_filters.NumberFilter(field_name='price_competitiveness', lookup_expr='gte')
    price_competitiveness_max = django_filters.NumberFilter(field_name='price_competitiveness', lookup_expr='lte')
    
    # Delivery rate filter
    on_time_delivery_rate_min = django_filters.NumberFilter(field_name='on_time_delivery_rate', lookup_expr='gte')
    on_time_delivery_rate_max = django_filters.NumberFilter(field_name='on_time_delivery_rate', lookup_expr='lte')
    
    # Date filters
    evaluation_date_from = django_filters.DateTimeFilter(field_name='evaluation_date', lookup_expr='gte')
    evaluation_date_to = django_filters.DateTimeFilter(field_name='evaluation_date', lookup_expr='lte')
    
    # Related filters
    supplier = django_filters.ModelChoiceFilter(queryset=Supplier.objects.all())
    evaluated_by = django_filters.NumberFilter(field_name='evaluated_by__id')
    
    # Special filters
    top_performers = django_filters.BooleanFilter(method='filter_top_performers')
    poor_performers = django_filters.BooleanFilter(method='filter_poor_performers')
    
    class Meta:
        model = SupplierPerformance
        fields = {}
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields."""
        if not value:
            return queryset
        
        return queryset.filter(
            Q(supplier__name__icontains=value) |
            Q(notes__icontains=value)
        )
    
    def filter_top_performers(self, queryset, name, value):
        """Filter for top performing suppliers."""
        if value:
            return queryset.filter(overall_rating__gte=4.0)
        return queryset
    
    def filter_poor_performers(self, queryset, name, value):
        """Filter for poor performing suppliers."""
        if value:
            return queryset.filter(overall_rating__lt=3.0)
        return queryset


class PurchaseAnalyticsFilter(django_filters.FilterSet):
    """Filter for purchase analytics."""
    
    # Date filters
    period_start_from = django_filters.DateTimeFilter(field_name='period_start', lookup_expr='gte')
    period_start_to = django_filters.DateTimeFilter(field_name='period_start', lookup_expr='lte')
    period_end_from = django_filters.DateTimeFilter(field_name='period_end', lookup_expr='gte')
    period_end_to = django_filters.DateTimeFilter(field_name='period_end', lookup_expr='lte')
    
    # Financial filters
    total_value_min = django_filters.NumberFilter(field_name='total_value', lookup_expr='gte')
    total_value_max = django_filters.NumberFilter(field_name='total_value', lookup_expr='lte')
    average_order_value_min = django_filters.NumberFilter(field_name='average_order_value', lookup_expr='gte')
    average_order_value_max = django_filters.NumberFilter(field_name='average_order_value', lookup_expr='lte')
    
    # Order filters
    total_orders_min = django_filters.NumberFilter(field_name='total_orders', lookup_expr='gte')
    total_orders_max = django_filters.NumberFilter(field_name='total_orders', lookup_expr='lte')
    
    # Performance filters
    on_time_delivery_rate_min = django_filters.NumberFilter(field_name='on_time_delivery_rate', lookup_expr='gte')
    on_time_delivery_rate_max = django_filters.NumberFilter(field_name='on_time_delivery_rate', lookup_expr='lte')
    
    # Related filters
    top_supplier = django_filters.ModelChoiceFilter(queryset=Supplier.objects.all())
    
    # Special filters
    current_period = django_filters.BooleanFilter(method='filter_current_period')
    last_30_days = django_filters.BooleanFilter(method='filter_last_30_days')
    
    class Meta:
        model = PurchaseAnalytics
        fields = {}
    
    def filter_current_period(self, queryset, name, value):
        """Filter for current period analytics."""
        if value:
            now = timezone.now()
            return queryset.filter(
                period_start__lte=now,
                period_end__gte=now
            )
        return queryset
    
    def filter_last_30_days(self, queryset, name, value):
        """Filter for last 30 days analytics."""
        if value:
            thirty_days_ago = timezone.now() - timedelta(days=30)
            return queryset.filter(period_end__gte=thirty_days_ago)
        return queryset
