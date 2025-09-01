"""
Staging settings for iNEAT ERP project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='staging.ineat.com', cast=lambda v: [s.strip() for s in v.split(',')])

# Security settings for staging
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# CSRF settings for staging
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='https://staging.ineat.com', cast=lambda v: [s.strip() for s in v.split(',')])

# Session settings for staging
SESSION_COOKIE_SECURE = True

# CORS settings for staging
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='https://staging.ineat.com', cast=lambda v: [s.strip() for s in v.split(',')])
CORS_ALLOW_ALL_ORIGINS = False

# Email configuration for staging
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@staging.ineat.com')

# Database configuration for staging
DATABASES['default'].update({
    'CONN_MAX_AGE': 60,
    'OPTIONS': {
        'sslmode': 'require',
    }
})

# Cache configuration for staging
CACHES['default'].update({
    'OPTIONS': {
        'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        'CONNECTION_POOL_KWARGS': {
            'max_connections': 50,
            'retry_on_timeout': True,
        }
    }
})

# Logging for staging
LOGGING['handlers']['file']['filename'] = '/var/log/ineat/django.log'
LOGGING['handlers']['audit']['filename'] = '/var/log/ineat/audit.log'

# JWT settings for staging
SIMPLE_JWT.update({
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=3),
})

# Web3 settings for staging
WEB3_PROVIDER_URL = config('WEB3_PROVIDER_URL', default='https://goerli.infura.io/v3/YOUR_INFURA_KEY')
WEB3_NETWORK_ID = config('WEB3_NETWORK_ID', default=5, cast=int)  # Goerli testnet

# Security settings
AXES_ENABLED = True
AXES_FAILURE_LIMIT = 3
AXES_COOLOFF_TIME = 2  # 2 hours
RATELIMIT_ENABLE = True

# Sentry configuration for staging
SENTRY_DSN = config('SENTRY_DSN', default='')
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=True,
        environment='staging',
    )

# File storage for staging (S3)
if config('USE_S3', default=False, cast=bool):
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
    
    AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
    AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
    AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='')
    AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
