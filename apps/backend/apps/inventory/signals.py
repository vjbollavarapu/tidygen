"""
Inventory management signals.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Product, StockMovement, PurchaseOrder, PurchaseOrderItem


@receiver(post_save, sender=StockMovement)
def update_product_stock(sender, instance, created, **kwargs):
    """Update product stock when stock movement is created."""
    if created:
        product = instance.product
        
        if instance.movement_type == 'in':
            product.current_stock += instance.quantity
        elif instance.movement_type == 'out':
            product.current_stock -= instance.quantity
        elif instance.movement_type == 'adjustment':
            product.current_stock = instance.quantity
        
        product.save()


@receiver(post_save, sender=PurchaseOrderItem)
def update_purchase_order_total(sender, instance, created, **kwargs):
    """Update purchase order total when items are added/modified."""
    purchase_order = instance.purchase_order
    
    # Recalculate total
    total = sum(item.total_price for item in purchase_order.items.all())
    purchase_order.total_amount = total
    purchase_order.save()


@receiver(post_delete, sender=PurchaseOrderItem)
def update_purchase_order_total_on_delete(sender, instance, **kwargs):
    """Update purchase order total when items are deleted."""
    purchase_order = instance.purchase_order
    
    # Recalculate total
    total = sum(item.total_price for item in purchase_order.items.all())
    purchase_order.total_amount = total
    purchase_order.save()


@receiver(post_save, sender=Product)
def create_initial_stock_movement(sender, instance, created, **kwargs):
    """Create initial stock movement for new products."""
    if created and instance.current_stock > 0:
        StockMovement.objects.create(
            product=instance,
            movement_type='in',
            quantity=instance.current_stock,
            reference_number='INITIAL',
            notes='Initial stock'
        )
