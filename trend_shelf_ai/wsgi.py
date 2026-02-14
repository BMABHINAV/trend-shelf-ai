"""
WSGI config for trend_shelf_ai project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_shelf_ai.settings')

application = get_wsgi_application()