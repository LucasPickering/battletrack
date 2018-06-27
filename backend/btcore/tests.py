from vcr import VCR

from django.test import Client, TestCase

vcr = VCR(
    cassette_library_dir='fixtures',
    record_mode='new_episodes',
    match_on=['uri', 'method'],
    filter_headers=['Authorization'],
)


class BtTestCase(TestCase):
    def setUp(self):
        super().setUp()
        self.client = Client()

    def check_object(self, obj, **kwargs):
        for key, val in kwargs.items():
            self.assertEqual(val, obj[key], f"Field '{key}'")

    def get(self, *args, **kwargs):
        return self.client.get(*args, format='json', **kwargs).json()

    def get_match(self, id):
        return self.get(f'/api/core/matches/{id}')

    def get_player(self, shard, key):
        return self.get(f'/api/core/players/{shard}/{key}?popMatches')


class MatchTests(BtTestCase):

    MATCHES = {
        'd86e3e72-8c0e-4018-a79f-f15ece28ed89': {
            'shard': 'pc-na',
            'mode': 'duo',
            'perspective': 'fpp',
            'map': {'name': 'Erangel_Main', 'size': 8000},
            'date': '2018-06-12T22:40:14-04:00',
            'duration': 1784,
            'custom_match': False,
        },
        '99589fb8-57a6-44a7-9ff5-727daa0ded38': {
            'shard': 'pc-eu',
            'mode': 'squad',
            'perspective': 'fpp',
            'map': {'name': 'Savage_Main', 'size': 4000},
            'date': '2018-06-26T13:54:30-04:00',
            'duration': 1327,
            'custom_match': False,
        },
    }

    @vcr.use_cassette()
    def test_get_match(self):
        for match_id, data in self.MATCHES.items():
            self.check_object(self.get_match(match_id), id=match_id, **data)


class PlayerTests(BtTestCase):

    PLAYER_NAME = 'zdkdz'

    @vcr.use_cassette()
    def test_get_player(self):
        player = self.get_player(shard='pc-na', key=self.PLAYER_NAME)
        self.check_object(player, name=self.PLAYER_NAME)

        # Make sure getting by ID returns the same thing
        self.assertEqual(player, self.get_player(shard='pc-na', key=player['id']))

    @vcr.use_cassette()
    def test_player_match(self):
        player = self.get_player(shard='pc-na', key=self.PLAYER_NAME)
        matches = player['matches']
        self.assertEqual(10, len(matches))
        match = matches[2]  # Chose this match because it had non-zero values

        player = self.get_player(shard='pc-na', key=self.PLAYER_NAME)
        self.check_object(match, match_id='1b8263d0-a4c6-4b7f-882f-ad134b458681')
        self.assertEqual(match['roster'], [
            {'player_id': 'account.5e5642fcfb2c44c58acb2d22ecc9777c', 'player_name': 'zdkdz'},
            {'player_id': 'account.f2692b5c8d7c489d8f9a0aecf6500119', 'player_name': 'DJE1337'},
        ])
        self.check_object(
            match['summary'],
            shard='pc-na',
            mode='duo',
            perspective='fpp',
            map_name='Desert_Main',
            date='2018-06-22T23:51:36-04:00',
            duration=1750,
            custom_match=False,
        )
        self.check_object(
            match['stats'],
            assists=0,
            boosts=2,
            damage_dealt=267.012451,
            dbnos=1,
            death_type='byplayer',
            headshot_kills=1,
            heals=7,
            kill_place=12,
            kill_points=1410,
            kill_streaks=2,
            kills=2,
            longest_kill=33.0,
            most_damage=0,
            revives=0,
            ride_distance=3466.68213,
            road_kills=0,
            swim_distance=0.0,
            team_kills=0,
            time_survived=1459.0,
            vehicle_destroys=0,
            walk_distance=2707.56934,
            weapons_acquired=4,
            win_place=4,
            win_points=1648,
        )
