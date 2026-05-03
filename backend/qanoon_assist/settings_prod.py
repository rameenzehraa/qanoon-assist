"""
Production settings for Qanoon Assist.

Imports everything from settings.py and overrides what differs in production.
Set DJANGO_SETTINGS_MODULE=qanoon_assist.settings_prod on the server.
"""

import dj_database_url
from decouple import Csv, config

from .settings import *  # noqa: F401, F403

# ── Core ──────────────────────────────────────────────────────────────────────

DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost', cast=Csv())

# ── Static files (WhiteNoise) ─────────────────────────────────────────────────
# WhiteNoise must sit immediately after SecurityMiddleware so it intercepts
# static-file requests before any auth or CSRF middleware runs.

MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # noqa: F405

STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405

# Django 4.2+ STORAGES replaces the deprecated STATICFILES_STORAGE setting.
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

# ── Database (Supabase → DATABASE_URL) ───────────────────────────────────────
# Supabase provides a PostgreSQL connection string in the form:
#   postgresql://user:password@host:port/dbname
# Set DATABASE_URL in the Render environment dashboard.
# The sqlite fallback is only reached when running `manage.py check` locally
# without an active DATABASE_URL.

DATABASES = {
    'default': dj_database_url.config(
        env='DATABASE_URL',
        default='sqlite:///db-check-only.sqlite3',
        conn_max_age=600,
        ssl_require=config('DATABASE_SSL_REQUIRE', default=True, cast=bool),
    )
}

# ── CORS ──────────────────────────────────────────────────────────────────────
# Comma-separated list of allowed frontend origins.
# Example: https://qanoon-assist.vercel.app,https://www.qanoon-assist.com

CORS_ALLOWED_ORIGINS = config('CORS_ORIGINS', default='', cast=Csv())
CORS_ALLOW_CREDENTIALS = True

# ── Security headers ──────────────────────────────────────────────────────────
# Render (and most PaaS) terminates TLS at the load balancer and forwards
# requests over HTTP internally, so we trust the X-Forwarded-Proto header
# instead of redirecting at the Django level.

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False          # handled by Render's load balancer
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000       # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
