import logging
import requests
import traceback

from django.conf import settings
from django.db import models
from django.http import Http404

from . import devapi

api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)
logger = logging.getLogger(settings.BT_LOGGER_NAME)


class DevAPIQuerySet(models.QuerySet):
    def _get_from_db(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    def _get_from_api(self, *args, **kwargs):
        try:
            data = self._execute_api_query(*args, **kwargs)
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

        return self._save_api_data(data, *args, **kwargs)

    def _save_api_data(self, data, *args, **kwargs):
        # Deserialize the data and save it
        serializer = self.model.serializer.from_dev_data(data)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    def get(self, *args, **kwargs):
        try:
            return self._get_from_db(*args, **kwargs)
        except self.model.DoesNotExist:
            # Object isn't in the DB, try to fetch it from the API
            self._get_from_api(*args, **kwargs)

            # Re-run the original query to make sure we re-use select_related, etc.
            return self._get_from_db(*args, **kwargs)

    def preload(self, **kwargs):
        """
        @brief      Pre-loads an objects of this query set matching the given fields from the API.
                    This will guarantee that the object matching the given fields will be in the DB
                    after this call. Pre-existing items are not overwritten.

        @param      self      The object
        @param      api_args  Additional arguments to pass to the API, but not to use on the DB
        @param      kwargs    The fields to query by

        @return     None
        """
        if not self.filter(**kwargs).exists():
            self._get_from_api(**kwargs)

    def multi_preload(self, field, values):
        """
        @brief      Pre-loads all objects of this query set matching the given fields from the API.
                    This will guarantee that all objects matching the fields will be stored in the
                    DB upon completion of this call. Pre-existing items are not overwritten.

        @param      self    The object
        @param      field   The field to query on, e.g. 'id' or 'name'
        @param      values  The values to query on the given field, e.g. [1, 2, 3]

        @return     None
        """
        values = set(values)

        # Get a set of pre-existing objects
        filtr = {field + '__in': values}  # Rule to test if this is a value we care about
        existing = set(self.filter(**filtr).values_list(field, flat=True))

        # Pull all necessary objects from the API and save them in a list
        to_pull = values - existing
        data = [self._execute_api_query(**{field: val}) for val in to_pull]

        # Deserialize the data and save it
        serializer = self.model.serializer.from_dev_data(data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()


class MatchQuerySet(DevAPIQuerySet):
    def _execute_api_query(self, id):
        return api.get_match(id)


class PlayerQuerySet(DevAPIQuerySet):
    def _execute_api_query(self, **kwargs):
        return api.get_player(**kwargs)

    def _save_api_data(self, data, shard, *args, **kwargs):
        # Deserialize the data and save it. First, check if the player is already in the DB so
        # they can be updated instead of inserted
        try:
            player = self._get_from_db(**kwargs)
            serializer = self.model.serializer.from_dev_data(data, instance=player)
        except self.model.DoesNotExist:
            serializer = self.model.serializer.from_dev_data(data)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    def get(self, shard, hit_api=True, *args, **kwargs):
        # Pull latest data from API, will add Player if missing, or if Player is already in DB,
        # will just add latest PlayerMatches
        if hit_api:
            self._get_from_api(*args, shard=shard, **kwargs)
        return self._get_from_db(*args, **kwargs)
