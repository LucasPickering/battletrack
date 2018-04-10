import requests


def http_get(url, headers):
    r = requests.get(url, headers=headers)
    r.raise_for_status()
    return r.json()


class BlueholeAPI:

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

    def request(self, shard, endpoint):
        url = self.URL_FMT.format(shard=shard, endpoint=endpoint)
        return http_get(url, self._headers)

    def get_player(self, shard, player_id):
        return self.request(shard, 'players/{player_id}')['data']

    def get_players_by_name(self, shard, *player_names):
        names_str = ','.join(player_names)
        return self.request(shard, f'players?filter[playerNames]={names_str}')['data']

    def get_match(self, shard, match_id):
        return self.request(shard, f'matches/{match_id}')

    def get_telemetry(self, match_id):
        incl = self.get_match(match_id)['included']
        # We have to search this list for a dict with the telemetry...
        for item in incl:
            # Telemetry seems to be the only item with the type 'asset'
            if item['type'] == 'asset':
                tel_url = item['attributes']['URL']
                break

        r = requests.get(tel_url, headers=self._headers)
        r.raise_for_status()
        return r.json()
