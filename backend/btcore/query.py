import logging
import requests
import traceback

from django.conf import settings
from django.db import models
from django.http import Http404

logger = logging.getLogger(settings.BT_LOGGER_NAME)


class DevAPIQuerySet(models.QuerySet):
    def get(self, *args, **kwargs):
        try:
            return super().get(*args, **kwargs)
        except self.model.DoesNotExist:
            try:
                # Object isn't in the DB, try to fetch it from the API
                return self.model.get_from_api(*args, **kwargs)
            except requests.exceptions.HTTPError as e:
                # Re-throw the requests error as a Django 404
                raise Http404(str(e))
            except Exception as e:
                # Django likes to silence these errors, but we will not be silenced!
                logger.error(traceback.format_exc())
                raise e  # Re-raise it


class DevAPIManager(models.Manager):
    def get_queryset(self):
        return DevAPIQuerySet(self.model)
