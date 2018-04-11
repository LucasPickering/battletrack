import requests


def http_get(url, headers):
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json()


class DevAPI:

    URL_FMT = 'https://api.playbattlegrounds.com/shards/{shard}/{endpoint}'

    def __init__(self, key):
        self._headers = {
            'Accept': 'application/vnd.api+json',
            'Authorization': key,
        }

    @classmethod
    def from_file(cls, file_name):
        # Read the API key from the given file
        with open(file_name) as f:
            key = f.read().strip()
        return cls(key)  # Instantiate the API

    def http_get(self, url):
        r = requests.get(url, headers=self._headers)
        r.raise_for_status()
        return r.json()

    def request(self, shard, endpoint):
        url = self.URL_FMT.format(shard=shard, endpoint=endpoint)
        return self.http_get(url)

    def get_player_by_id(self, shard, id):
        return self.request(shard, f'players/{id}')['data']

    def get_players_by_name(self, shard, *names):
        names_str = ','.join(names)
        return self.request(shard, f'players?filter[playerNames]={names_str}')['data']

    def get_player_by_name(self, shard, name):
        return self.get_players_by_name(shard, name)[0]

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
            return self.get_player_by_id(shard, id)
        elif name:
            return self.get_player_by_name(shard, name)
        raise ValueError("No player ID or name specified")

    def get_match(self, id):
        return self.request('pc-na', f'matches/{id}')  # Matches can be fetched from any shard

    def get_telemetry_by_match(self, match):
        incl = self.get_match(match)['included']
        # We have to search this list for a dict with the telemetry...
        for item in incl:
            # Telemetry seems to be the only item with the type 'asset'
            if item['type'] == 'asset':
                tel_url = item['attributes']['URL']
                break

        return self.http_get(tel_url)

    def get_telemetry(self, match=None, url=None):
        """
        @brief      Gets telemetry data by either match ID or telemetry URL. If match ID is
                    specified, the match with that ID is fetched, then the telemetry URL is
                    retrieved from the match data and fetched (this makes two API requests). If
                    just the URL is specified, then that URL is fetched and returned directly.

        @param      self      The object
        @param      match_id  The match identifier
        @param      url       The url

        @return     The telemetry.
        """
        if match:
            return self.get_telemetry_by_match(match)
        elif url:
            return self.http_get(url)
        else:
            raise ValueError("No match ID or telemetry URL specified")
