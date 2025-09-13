"""
Purchasing Management URL configuration.

This module defines all the URL patterns for the purchasing management system,
including purchase orders, receipts, procurement requests, supplier performance, and analytics.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.purchasing.views import (
    PurchaseOrderViewSet, PurchaseOrderItemViewSet,
    PurchaseReceiptViewSet, PurchaseReceiptItemViewSet,
    ProcurementRequestViewSet, ProcurementRequestItemViewSet,
    SupplierPerformanceViewSet, PurchaseAnalyticsViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'purchase-order-items', PurchaseOrderItemViewSet, basename='purchaseorderitem')
router.register(r'purchase-receipts', PurchaseReceiptViewSet, basename='purchasereceipt')
router.register(r'purchase-receipt-items', PurchaseReceiptItemViewSet, basename='purchasereceiptitem')
router.register(r'procurement-requests', ProcurementRequestViewSet, basename='procurementrequest')
router.register(r'procurement-request-items', ProcurementRequestItemViewSet, basename='procurementrequestitem')
router.register(r'supplier-performance', SupplierPerformanceViewSet, basename='supplierperformance')
router.register(r'analytics', PurchaseAnalyticsViewSet, basename='purchaseanalytics')

urlpatterns = [
    # Include all router URLs
    path('', include(router.urls)),
]
