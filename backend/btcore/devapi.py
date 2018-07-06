import asyncio
import concurrent.futures
import logging
import requests

from django.conf import settings

from .util import timed

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

    def get(self, url):
        r, time = timed(lambda: requests.get(url, headers=self._headers))
        logger.info(f"Dev API GET {url} {r.status_code} {time:.4f}s")
        r.raise_for_status()
        return r.json()

    def get_bulk(self, urls):
        # Convert the input to a list, then check if it's empty to avoid error conditions
        url_list = list(urls)
        if not url_list:
            return []

        # Asynchronous!
        async def helper():
            with concurrent.futures.ThreadPoolExecutor(max_workers=len(url_list)) as executor:
                loop = asyncio.get_event_loop()
                futures = (loop.run_in_executor(executor, self.get, url) for url in url_list)
                return await asyncio.gather(*futures)
        return asyncio.run(helper())

    def get_match_url(self, id):
        return self.URL_FMT.format(shard='pc-na', endpoint=f'matches/{id}')

    def get_players_url_by_name(self, shard, *names):
        names_str = ','.join(names)
        return self.URL_FMT.format(shard=shard, endpoint=f'players?filter[playerNames]={names_str}')

    def get_player_url(self, shard, id=None, name=None):
        """
        @brief      Gets a URL for a player by either ID or name. If neither ID nor name is
                    specified, an error is raised.

        @param      self   The object
        @param      shard  The shard
        @param      id     The player ID
        @param      name   The player name

        @return     The player with the given ID/name
        """
        if id:
            return self.URL_FMT.format(shard=shard, endpoint=f'players/{id}')
        elif name:
            return self.get_players_url_by_name(shard, name)
        raise ValueError("No player ID or name specified")

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
