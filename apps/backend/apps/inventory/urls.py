"""
Inventory URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductCategoryViewSet, ProductViewSet, StockMovementViewSet,
    SupplierViewSet, PurchaseOrderViewSet, PurchaseOrderItemViewSet,
    InventoryDashboardViewSet
)

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet, basename='product-category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'purchase-order-items', PurchaseOrderItemViewSet, basename='purchase-order-item')
router.register(r'dashboard', InventoryDashboardViewSet, basename='inventory-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
