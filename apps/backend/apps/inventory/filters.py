"""
Inventory management filters.
"""
from django_filters import rest_framework as filters
from django.db import models
from .models import Product, ProductCategory, StockMovement, Supplier, PurchaseOrder


class ProductFilter(filters.FilterSet):
    """Product filter."""
    name = filters.CharFilter(lookup_expr='icontains')
    sku = filters.CharFilter(lookup_expr='icontains')
    category = filters.ModelChoiceFilter(queryset=ProductCategory.objects.all())
    min_price = filters.NumberFilter(field_name='selling_price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='selling_price', lookup_expr='lte')
    min_stock = filters.NumberFilter(field_name='current_stock', lookup_expr='gte')
    max_stock = filters.NumberFilter(field_name='current_stock', lookup_expr='lte')
    stock_status = filters.ChoiceFilter(
        choices=[
            ('low_stock', 'Low Stock'),
            ('normal', 'Normal'),
            ('overstocked', 'Overstocked'),
            ('out_of_stock', 'Out of Stock'),
        ],
        method='filter_stock_status'
    )
    created_after = filters.DateFilter(field_name='created', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = Product
        fields = {
            'is_active': ['exact'],
            'is_digital': ['exact'],
            'cost_price': ['gte', 'lte'],
            'selling_price': ['gte', 'lte'],
            'current_stock': ['gte', 'lte'],
        }

    def filter_stock_status(self, queryset, name, value):
        """Filter by stock status."""
        if value == 'low_stock':
            return queryset.filter(current_stock__lte=models.F('min_stock_level'))
        elif value == 'normal':
            return queryset.filter(
                current_stock__gt=models.F('min_stock_level'),
                current_stock__lt=models.F('max_stock_level')
            )
        elif value == 'overstocked':
            return queryset.filter(current_stock__gte=models.F('max_stock_level'))
        elif value == 'out_of_stock':
            return queryset.filter(current_stock=0)
        return queryset


class ProductCategoryFilter(filters.FilterSet):
    """Product category filter."""
    name = filters.CharFilter(lookup_expr='icontains')
    description = filters.CharFilter(lookup_expr='icontains')
    parent = filters.ModelChoiceFilter(queryset=ProductCategory.objects.all())
    has_products = filters.BooleanFilter(method='filter_has_products')
    created_after = filters.DateFilter(field_name='created', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = ProductCategory
        fields = {
            'parent': ['exact', 'isnull'],
        }

    def filter_has_products(self, queryset, name, value):
        """Filter categories that have products."""
        if value:
            return queryset.filter(products__isnull=False).distinct()
        return queryset.filter(products__isnull=True).distinct()


class StockMovementFilter(filters.FilterSet):
    """Stock movement filter."""
    product_name = filters.CharFilter(field_name='product__name', lookup_expr='icontains')
    product_sku = filters.CharFilter(field_name='product__sku', lookup_expr='icontains')
    reference_number = filters.CharFilter(lookup_expr='icontains')
    notes = filters.CharFilter(lookup_expr='icontains')
    min_quantity = filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    max_quantity = filters.NumberFilter(field_name='quantity', lookup_expr='lte')
    created_after = filters.DateFilter(field_name='created', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = StockMovement
        fields = {
            'movement_type': ['exact'],
            'quantity': ['gte', 'lte'],
            'created': ['gte', 'lte'],
        }


class SupplierFilter(filters.FilterSet):
    """Supplier filter."""
    name = filters.CharFilter(lookup_expr='icontains')
    contact_person = filters.CharFilter(lookup_expr='icontains')
    email = filters.CharFilter(lookup_expr='icontains')
    phone = filters.CharFilter(lookup_expr='icontains')
    has_orders = filters.BooleanFilter(method='filter_has_orders')
    min_orders = filters.NumberFilter(method='filter_min_orders')
    created_after = filters.DateFilter(field_name='created', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = Supplier
        fields = {
            'payment_terms': ['exact', 'icontains'],
        }

    def filter_has_orders(self, queryset, name, value):
        """Filter suppliers that have purchase orders."""
        if value:
            return queryset.filter(purchase_orders__isnull=False).distinct()
        return queryset.filter(purchase_orders__isnull=True).distinct()

    def filter_min_orders(self, queryset, name, value):
        """Filter suppliers with minimum number of orders."""
        return queryset.annotate(
            order_count=models.Count('purchase_orders')
        ).filter(order_count__gte=value)


class PurchaseOrderFilter(filters.FilterSet):
    """Purchase order filter."""
    order_number = filters.CharFilter(lookup_expr='icontains')
    supplier_name = filters.CharFilter(field_name='supplier__name', lookup_expr='icontains')
    notes = filters.CharFilter(lookup_expr='icontains')
    min_amount = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    order_date_after = filters.DateFilter(field_name='order_date', lookup_expr='gte')
    order_date_before = filters.DateFilter(field_name='order_date', lookup_expr='lte')
    expected_delivery_after = filters.DateFilter(field_name='expected_delivery', lookup_expr='gte')
    expected_delivery_before = filters.DateFilter(field_name='expected_delivery', lookup_expr='lte')
    created_after = filters.DateFilter(field_name='created', lookup_expr='gte')
    created_before = filters.DateFilter(field_name='created', lookup_expr='lte')

    class Meta:
        model = PurchaseOrder
        fields = {
            'status': ['exact'],
            'total_amount': ['gte', 'lte'],
            'order_date': ['gte', 'lte'],
            'expected_delivery': ['gte', 'lte'],
        }
