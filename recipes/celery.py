import os

from celery import Celery
from recipes.logging import getLogger

logger = getLogger(__name__)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recipes.settings")
logger.info("Initializing Celery application")
app = Celery("recipes")
app.config_from_object("django.conf:settings", namespace="CELERY")
logger.info("Loading Celery configuration from Django settings")
app.autodiscover_tasks()
logger.info("Celery task autodiscovery completed")
