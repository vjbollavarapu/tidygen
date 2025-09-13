"""
Purchasing Management Signals

This module contains Django signals for the purchasing management system,
providing automated logic for purchase orders, receipts, procurement requests, and analytics.
"""

import logging
from django.db.models.signals import post_save, pre_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.utils import timezone
from django.db import models
from decimal import Decimal

from apps.purchasing.models import (
    PurchaseOrder, PurchaseOrderItem, PurchaseReceipt, PurchaseReceiptItem,
    ProcurementRequest, ProcurementRequestItem, SupplierPerformance, PurchaseAnalytics
)

logger = logging.getLogger(__name__)


# ==================== PURCHASE ORDER SIGNALS ====================

@receiver(pre_save, sender=PurchaseOrder)
def purchase_order_pre_save(sender, instance, **kwargs):
    """Handle purchase order pre-save logic."""
    # Generate PO number if not set
    if not instance.po_number:
        instance.po_number = instance.generate_po_number()
    
    # Set approval date if status is being changed to approved
    if instance.pk:
        try:
            old_instance = PurchaseOrder.objects.get(pk=instance.pk)
            if old_instance.status != 'approved' and instance.status == 'approved':
                instance.approval_date = timezone.now()
        except PurchaseOrder.DoesNotExist:
            pass


@receiver(post_save, sender=PurchaseOrder)
def purchase_order_post_save(sender, instance, created, **kwargs):
    """Handle purchase order post-save logic."""
    if created:
        logger.info(f"New purchase order created: {instance.po_number}")
    else:
        logger.info(f"Purchase order updated: {instance.po_number} - Status: {instance.status}")
    
    # Update analytics when purchase order status changes
    if not created and instance.status in ['fully_received', 'closed']:
        update_purchase_analytics(instance.organization)


@receiver(post_delete, sender=PurchaseOrder)
def purchase_order_post_delete(sender, instance, **kwargs):
    """Handle purchase order deletion."""
    logger.info(f"Purchase order deleted: {instance.po_number}")
    update_purchase_analytics(instance.organization)


# ==================== PURCHASE ORDER ITEM SIGNALS ====================

@receiver(pre_save, sender=PurchaseOrderItem)
def purchase_order_item_pre_save(sender, instance, **kwargs):
    """Handle purchase order item pre-save logic."""
    # Store product details at time of order
    if instance.product:
        instance.product_name = instance.product.name
        instance.product_sku = instance.product.sku
        instance.product_description = instance.product.description
    
    # Calculate total price
    instance.total_price = instance.quantity_ordered * instance.unit_price
    
    # Calculate pending quantity
    instance.quantity_pending = instance.quantity_ordered - instance.quantity_received


@receiver(post_save, sender=PurchaseOrderItem)
def purchase_order_item_post_save(sender, instance, created, **kwargs):
    """Handle purchase order item post-save logic."""
    # Update purchase order totals
    instance.purchase_order.calculate_totals()
    
    if created:
        logger.info(f"New purchase order item added: {instance.product_name} to PO {instance.purchase_order.po_number}")
    else:
        logger.info(f"Purchase order item updated: {instance.product_name} in PO {instance.purchase_order.po_number}")


@receiver(post_delete, sender=PurchaseOrderItem)
def purchase_order_item_post_delete(sender, instance, **kwargs):
    """Handle purchase order item deletion."""
    logger.info(f"Purchase order item deleted: {instance.product_name} from PO {instance.purchase_order.po_number}")
    # Update purchase order totals
    instance.purchase_order.calculate_totals()


# ==================== PURCHASE RECEIPT SIGNALS ====================

@receiver(pre_save, sender=PurchaseReceipt)
def purchase_receipt_pre_save(sender, instance, **kwargs):
    """Handle purchase receipt pre-save logic."""
    # Generate receipt number if not set
    if not instance.receipt_number:
        instance.receipt_number = instance.generate_receipt_number()


@receiver(post_save, sender=PurchaseReceipt)
def purchase_receipt_post_save(sender, instance, created, **kwargs):
    """Handle purchase receipt post-save logic."""
    if created:
        logger.info(f"New purchase receipt created: {instance.receipt_number}")
    else:
        logger.info(f"Purchase receipt updated: {instance.receipt_number} - Status: {instance.status}")
    
    # Update purchase order status based on receipt
    instance.update_purchase_order_status()


@receiver(post_delete, sender=PurchaseReceipt)
def purchase_receipt_post_delete(sender, instance, **kwargs):
    """Handle purchase receipt deletion."""
    logger.info(f"Purchase receipt deleted: {instance.receipt_number}")
    # Update purchase order status
    instance.update_purchase_order_status()


# ==================== PURCHASE RECEIPT ITEM SIGNALS ====================

@receiver(post_save, sender=PurchaseReceiptItem)
def purchase_receipt_item_post_save(sender, instance, created, **kwargs):
    """Handle purchase receipt item post-save logic."""
    # Update purchase order item received quantity
    po_item = instance.purchase_order_item
    total_received = PurchaseReceiptItem.objects.filter(
        purchase_order_item=po_item
    ).aggregate(total=models.Sum('quantity_received'))['total'] or Decimal('0.00')
    
    po_item.quantity_received = total_received
    po_item.save()
    
    if created:
        logger.info(f"New receipt item added: {instance.quantity_received} units of {po_item.product_name}")
    else:
        logger.info(f"Receipt item updated: {instance.quantity_received} units of {po_item.product_name}")


@receiver(post_delete, sender=PurchaseReceiptItem)
def purchase_receipt_item_post_delete(sender, instance, **kwargs):
    """Handle purchase receipt item deletion."""
    # Update purchase order item received quantity
    po_item = instance.purchase_order_item
    total_received = PurchaseReceiptItem.objects.filter(
        purchase_order_item=po_item
    ).aggregate(total=models.Sum('quantity_received'))['total'] or Decimal('0.00')
    
    po_item.quantity_received = total_received
    po_item.save()
    
    logger.info(f"Receipt item deleted: {instance.quantity_received} units of {po_item.product_name}")


# ==================== PROCUREMENT REQUEST SIGNALS ====================

@receiver(pre_save, sender=ProcurementRequest)
def procurement_request_pre_save(sender, instance, **kwargs):
    """Handle procurement request pre-save logic."""
    # Generate request number if not set
    if not instance.request_number:
        instance.request_number = instance.generate_request_number()
    
    # Set review date if status is being changed to approved/rejected
    if instance.pk:
        try:
            old_instance = ProcurementRequest.objects.get(pk=instance.pk)
            if (old_instance.status not in ['approved', 'rejected'] and 
                instance.status in ['approved', 'rejected']):
                instance.review_date = timezone.now()
        except ProcurementRequest.DoesNotExist:
            pass


@receiver(post_save, sender=ProcurementRequest)
def procurement_request_post_save(sender, instance, created, **kwargs):
    """Handle procurement request post-save logic."""
    if created:
        logger.info(f"New procurement request created: {instance.request_number}")
    else:
        logger.info(f"Procurement request updated: {instance.request_number} - Status: {instance.status}")


@receiver(post_delete, sender=ProcurementRequest)
def procurement_request_post_delete(sender, instance, **kwargs):
    """Handle procurement request deletion."""
    logger.info(f"Procurement request deleted: {instance.request_number}")


# ==================== PROCUREMENT REQUEST ITEM SIGNALS ====================

@receiver(pre_save, sender=ProcurementRequestItem)
def procurement_request_item_pre_save(sender, instance, **kwargs):
    """Handle procurement request item pre-save logic."""
    # Store product details at time of request
    if instance.product:
        instance.product_name = instance.product.name
        instance.product_sku = instance.product.sku
        instance.product_description = instance.product.description
    
    # Calculate estimated total price
    if instance.estimated_unit_price:
        instance.estimated_total_price = instance.quantity * instance.estimated_unit_price


@receiver(post_save, sender=ProcurementRequestItem)
def procurement_request_item_post_save(sender, instance, created, **kwargs):
    """Handle procurement request item post-save logic."""
    # Update procurement request estimated cost
    instance.request.calculate_estimated_cost()
    
    if created:
        logger.info(f"New procurement request item added: {instance.product_name} to REQ {instance.request.request_number}")
    else:
        logger.info(f"Procurement request item updated: {instance.product_name} in REQ {instance.request.request_number}")


@receiver(post_delete, sender=ProcurementRequestItem)
def procurement_request_item_post_delete(sender, instance, **kwargs):
    """Handle procurement request item deletion."""
    logger.info(f"Procurement request item deleted: {instance.product_name} from REQ {instance.request.request_number}")
    # Update procurement request estimated cost
    instance.request.calculate_estimated_cost()


# ==================== SUPPLIER PERFORMANCE SIGNALS ====================

@receiver(pre_save, sender=SupplierPerformance)
def supplier_performance_pre_save(sender, instance, **kwargs):
    """Handle supplier performance pre-save logic."""
    # Calculate overall rating
    ratings = [
        instance.quality_rating,
        instance.communication_rating,
        instance.price_competitiveness
    ]
    instance.overall_rating = sum(ratings) / len(ratings)


@receiver(post_save, sender=SupplierPerformance)
def supplier_performance_post_save(sender, instance, created, **kwargs):
    """Handle supplier performance post-save logic."""
    if created:
        logger.info(f"New supplier performance record created for {instance.supplier.name}")
    else:
        logger.info(f"Supplier performance record updated for {instance.supplier.name}")


@receiver(post_delete, sender=SupplierPerformance)
def supplier_performance_post_delete(sender, instance, **kwargs):
    """Handle supplier performance deletion."""
    logger.info(f"Supplier performance record deleted for {instance.supplier.name}")


# ==================== PURCHASE ANALYTICS SIGNALS ====================

@receiver(post_save, sender=PurchaseAnalytics)
def purchase_analytics_post_save(sender, instance, created, **kwargs):
    """Handle purchase analytics post-save logic."""
    if created:
        logger.info(f"New purchase analytics record created for period {instance.period_start} - {instance.period_end}")
    else:
        logger.info(f"Purchase analytics record updated for period {instance.period_start} - {instance.period_end}")


@receiver(post_delete, sender=PurchaseAnalytics)
def purchase_analytics_post_delete(sender, instance, **kwargs):
    """Handle purchase analytics deletion."""
    logger.info(f"Purchase analytics record deleted for period {instance.period_start} - {instance.period_end}")


# ==================== HELPER FUNCTIONS ====================

def update_purchase_analytics(organization):
    """Update purchase analytics for an organization."""
    try:
        # This would typically be called asynchronously or in a background task
        # For now, we'll just log that analytics should be updated
        logger.info(f"Purchase analytics should be updated for organization: {organization.name}")
        
        # In a real implementation, you might:
        # 1. Calculate current period metrics
        # 2. Update or create PurchaseAnalytics record
        # 3. Send notifications if thresholds are exceeded
        
    except Exception as e:
        logger.error(f"Error updating purchase analytics for organization {organization.name}: {str(e)}")


# ==================== MODEL METHODS ====================

# Add these methods to the models if they don't exist

def calculate_totals(self):
    """Calculate totals for a purchase order."""
    from django.db import models
    
    items = self.items.all()
    self.subtotal = sum(item.total_price for item in items)
    self.total_amount = self.subtotal + self.tax_amount + self.shipping_cost - self.discount_amount
    self.save(update_fields=['subtotal', 'total_amount'])


def update_purchase_order_status(self):
    """Update purchase order status based on receipts."""
    from django.db import models
    
    total_ordered = self.items.aggregate(total=models.Sum('quantity_ordered'))['total'] or Decimal('0.00')
    total_received = self.items.aggregate(total=models.Sum('quantity_received'))['total'] or Decimal('0.00')
    
    if total_received == 0:
        self.status = 'sent'
    elif total_received < total_ordered:
        self.status = 'partially_received'
    else:
        self.status = 'fully_received'
    
    self.save(update_fields=['status'])


def calculate_estimated_cost(self):
    """Calculate estimated cost for a procurement request."""
    from django.db import models
    
    items = self.items.all()
    self.estimated_cost = sum(
        item.estimated_total_price for item in items 
        if item.estimated_total_price
    )
    self.save(update_fields=['estimated_cost'])


# Add these methods to the respective models
PurchaseOrder.calculate_totals = calculate_totals
PurchaseReceipt.update_purchase_order_status = update_purchase_order_status
ProcurementRequest.calculate_estimated_cost = calculate_estimated_cost
