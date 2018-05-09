
import logging
import requests
import traceback

from django.conf import settings
from django.db import models
from django.http import Http404

logger = logging.getLogger(settings.BT_LOGGER_NAME)


def pull_from_api(model, *args, **kwargs):
    data = model.get_from_api(*args, **kwargs)
    # Deserialize the data and save it
    serializer = model.serializer.from_dev_data(data)
    serializer.is_valid(raise_exception=True)
    serializer.save()


class DevAPIQuerySet(models.QuerySet):
    def get(self, *args, **kwargs):
        try:
            return super().get(*args, **kwargs)
        except self.model.DoesNotExist:
            try:
                # Object isn't in the DB, try to fetch it from the API
                pull_from_api(self.model, *args, **kwargs)

                # Re-run the original query to make sure we re-use select_related, etc.
                return super().get(*args, **kwargs)
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 404:
                    # If it was a 404, re-throw it as a Django 404
                    raise Http404(str(e))
                else:
                    # Otherwise, log the error
                    logger.error(traceback.format_exc())
                    raise e
            except Exception as e:
                # Django likes to silence these errors, but we will not be silenced!
                logger.error(traceback.format_exc())
                raise e  # Re-raise it


class DevAPIManager(models.Manager):
    def get_queryset(self):
        return DevAPIQuerySet(self.model)

    def preload(self, field, values, filters={}):
        """
        @brief      Pre-loads all objects of this manager matching the given filters/fields from the
                    API. This will guarantee that all objects matching the filter/fields will be
                    stored in the DB upon completion of this call. Pre-existing items are not
                    overwritten.

        @param      self        The object
        @param      field       The field to query on, e.g. 'id' or 'name'
        @param      values      The values to query on the given field, e.g. [1, 2, 3]
        @param      filters     Dict of scalar filters, e.g. {'shard': 'pc-na'}. Each of these
                                filters is applied to every query and passed to the API for
                                fetching.

        @return     None
        """
        values = set(values)

        # Get a set of pre-existing objects
        filtr = dict(filters)
        filtr.update({field + '__in': values})  # Rule to test if this is a value we care about
        existing = set(self.filter(**filtr).values_list(field, flat=True))

        # Pull all necessary objects from the API and save them in a list
        to_pull = values - existing
        data = [self.model.get_from_api(**{field: val}) for val in to_pull]

        # Deserialize the data and save it
        serializer = self.model.serializer.from_dev_data(data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
