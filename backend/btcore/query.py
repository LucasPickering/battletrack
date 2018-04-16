import logging
import requests
import traceback

from django.conf import settings
from django.db import models
from django.http import Http404

from . import util

logger = logging.getLogger(settings.BT_LOGGER_NAME)


class DevAPIQuerySet(models.QuerySet):
    @util.timed
    def get(self, *args, **kwargs):
        try:
            return super().get(*args, **kwargs)
        except self.model.DoesNotExist:
            try:
                # Object isn't in the DB, try to fetch it from the API
                data = self.model.get_from_api(*args, **kwargs)
                # Deserialize the data and save it
                serializer = self.model.dev_deserializer(data=data)
                serializer.is_valid(raise_exception=True)
                return serializer.save()
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
