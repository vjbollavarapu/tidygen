"""
Inventory app configuration.
"""
from django.apps import AppConfig


class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.inventory'
    verbose_name = 'Inventory Management'

    def ready(self):
        """Import signals when app is ready."""
        try:
            import apps.inventory.signals
        except ImportError:
            pass
