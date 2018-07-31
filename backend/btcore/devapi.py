import aiohttp
import asyncio
import logging
from aiohttp.client_exceptions import ClientResponseError

from django.conf import settings
from django.http import Http404

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

    def django_get(self, *args, **kwargs):
        """
        @brief      Performs a GET on the dev API, and wraps certain responses in Django HTTP
                    errors.

        @param      self    The object
        @param      args    Same as get
        @param      kwargs  Same as get

        @return     The output of get
        """
        try:
            return self.get(*args, **kwargs)
        except ClientResponseError as e:
            # Special handling for 404s, to re-throw them as Django 404s
            if e.status == 404:
                raise Http404(str(e))
            else:
                raise e  # Just re-raise it

    def get(self, *urls, bulk=False):
        async def helper():
            async with aiohttp.ClientSession(headers=self._headers) as session:
                async def fetch(url):
                    async with session.get(url) as resp:
                        logger.info(f"Dev API GET {url} {resp.status}")
                        resp.raise_for_status()
                        return await resp.json()

                return await asyncio.gather(*(fetch(url) for url in urls))

        num_urls = len(urls)
        if not bulk and num_urls != 1:
            raise ValueError(f"{num_urls} URLs given for non-bulk request. Must be exactly 1.")

        rv = asyncio.run(helper())
        return rv if bulk else rv[0]

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
