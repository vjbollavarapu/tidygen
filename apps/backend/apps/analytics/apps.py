"""
Analytics App Configuration

This module configures the analytics Django app and ensures signals are loaded.
"""

from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.analytics'
    verbose_name = 'Analytics & Reporting'

    def ready(self):
        import apps.analytics.signals
