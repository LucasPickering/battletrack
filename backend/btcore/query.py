import logging
import requests
import traceback

from django.conf import settings
from django.db import models, utils
from django.http import Http404

from . import devapi

_api = devapi.DevAPI(settings.DEV_API_KEY)
_logger = logging.getLogger(settings.BT_LOGGER_NAME)


class DevAPIQuerySet(models.QuerySet):
    def _get_from_db(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    def _insert_from_api(self, *args, **kwargs):
        try:
            url = self._get_api_url(*args, **kwargs)
            data = _api.get(url)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                # If it was a 404, re-throw it as a Django 404
                raise Http404(str(e))
            else:
                # Otherwise, log the error
                _logger.error(traceback.format_exc())
                raise e

        except Exception as e:
            # Django likes to silence these errors, but we will not be silenced!
            _logger.error(traceback.format_exc())
            raise e  # Re-raise it

        # Deserialize the data and save it
        serializer = self.model.serializer.from_dev_data(data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def get(self, *args, **kwargs):
        try:
            return self._get_from_db(*args, **kwargs)
        except self.model.DoesNotExist:
            # Object isn't in the DB, fetch it from the API
            try:
                self._insert_from_api(*args, **kwargs)
            except utils.IntegrityError as e:
                # It's possible that the object was inserted between our original DB get and our
                # attempted insertion. If we get an error because of a duplicate insertion, throw
                # it away and just fetch from the DB again.
                if 'already exists' not in str(e):
                    raise e
            return self._get_from_db(*args, **kwargs)  # Try again

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
            self._insert_from_api(**kwargs)

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
        data = _api.get(*(self._get_api_url(**{field: val}) for val in to_pull), bulk=True)

        # Deserialize the data and save it
        serializer = self.model.serializer.from_dev_data(data, many=True)
        serializer.is_valid(raise_exception=True)
        return serializer.save()


class MatchQuerySet(DevAPIQuerySet):
    _get_api_url = _api.get_match_url


class PlayerQuerySet(DevAPIQuerySet):
    _get_api_url = _api.get_player_url

    def get(self, shard=None, *args, **kwargs):
        # Pull latest data from API, will add Player if missing, or if Player is already in DB,
        # will just add latest PlayerMatches
        if shard:
            self._insert_from_api(*args, shard=shard, **kwargs)
        return self._get_from_db(*args, **kwargs)
