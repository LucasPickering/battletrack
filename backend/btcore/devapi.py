import logging
import requests

from django.conf import settings

from .util import Timed

logger = logging.getLogger(settings.BT_LOGGER_NAME)


class DevAPI:

    URL_FMT = 'https://api.playbattlegrounds.com/shards/{shard}/{endpoint}'

    def __init__(self, key):
        if not key:
            logger.warning("No Dev API key specified")
        self._headers = {
            'Accept': 'application/vnd.api+json',
            'Accept-Encoding': 'gzip',
            'Authorization': key,
        }

    @classmethod
    def from_file(cls, file_name):
        # Read the API key from the given file
        with open(file_name) as f:
            key = f.read().strip()
        return cls(key)  # Instantiate the API

    def get(self, url):
        with Timed("Dev API GET took {time}"):
            r = requests.get(url, headers=self._headers)
            logger.info(f"Dev API GET {url} {r.status_code}")
        r.raise_for_status()
        return r.json()

    def get_endpoint(self, shard, endpoint):
        url = self.URL_FMT.format(shard=shard, endpoint=endpoint)
        return self.get(url)

    def get_match(self, id):
        return self.get_endpoint('pc-na', f'matches/{id}')  # Matches can be fetched from any shard

    def get_players_by_name(self, shard, *names):
        names_str = ','.join(names)
        return self.get_endpoint(shard, f'players?filter[playerNames]={names_str}')['data']

    def get_player(self, shard, id=None, name=None):
        """
        @brief      Gets a player by either ID or name. If neither ID nor name is specified, an
                    error is raised.

        @param      self   The object
        @param      shard  The shard
        @param      id     The player ID
        @param      name   The player name

        @return     The player with the given ID/name
        """
        if id:
            return self.get_endpoint(shard, f'players/{id}')['data']
        elif name:
            return self.get_players_by_name(shard, name)[0]
        raise ValueError("No player ID or name specified")
