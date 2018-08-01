import os
from vcr import VCR

from django.conf import settings
from django.test import Client, TestCase

from . import devapi

FIXTURE_DIR = 'fixtures'

vcr = VCR(
    cassette_library_dir=os.path.join(FIXTURE_DIR, 'cassettes/'),
    record_mode='new_episodes',
    match_on=['uri', 'method'],
    filter_headers=['Authorization'],
)


class BtTestCase(TestCase):
    def setUp(self):
        super().setUp()
        self.client = Client()

    def check_dict(self, d, **kwargs):
        for key, val in kwargs.items():
            self.assertEqual(val, d[key], f"Field '{key}'")

    def check_sorted(self, l, key=lambda x: x, reverse=False):
        def cmp_func(a, b):
            return (a >= b) if reverse else (a <= b)
        self.assertTrue(all(cmp_func(key(l[i]), key(l[i + 1])) for i in range(len(l) - 1)))

    def get(self, *args, **kwargs):
        return self.client.get(*args, format='json', **kwargs).json()


class ApiTests(TestCase):
    def setUp(self):
        self.api = devapi.DevAPI(settings.DEV_API_KEY)

    def test_get_bulk_empty(self):
        self.assertEqual([], self.api.get(bulk=True))


class MatchTests(BtTestCase):

    MATCHES = {
        '5cf3ed16-6383-4172-bb60-8ead540d1245': {
            'shard': 'pc-eu',
            'mode': 'squad',
            'perspective': 'fpp',
            'map': {'name': 'Savage_Main', 'size': 4000},
            'date': '2018-07-11T12:46:57-04:00',
            'duration': 1380,
            'custom_match': False,
        },
        'c050b420-6d3d-4c52-9ed2-bac98d123875': {
            'shard': 'pc-eu',
            'mode': 'squad',
            'perspective': 'fpp',
            'map': {'name': 'Erangel_Main', 'size': 8000},
            'date': '2018-07-11T11:49:14-04:00',
            'duration': 1968,
            'custom_match': False,
        },
    }

    @vcr.use_cassette('match.yml')
    def get_match(self, id):
        return self.get(f'/api/core/matches/{id}')

    def setUp(self):
        super().setUp()
        self.matches = {match_id: self.get_match(match_id) for match_id in self.MATCHES.keys()}

    def test_get_match(self):
        for match_id, match in self.matches.items():
            self.check_dict(match, id=match_id, **self.MATCHES[match_id])

    def test_rosters_sorted(self):
        # Make sure all rosters are sorted by placement
        for match in self.matches.values():
            self.check_sorted(match['rosters'], key=lambda m: m['win_place'])


class PlayerTests(BtTestCase):

    SHARD = 'pc-eu'
    PLAYER_NAME = 'BreaK'
    CASSETTE_FILE = 'player.yml'

    @vcr.use_cassette(CASSETTE_FILE)
    def get_player(self, shard, key, pop_matches=True):
        params = 'popMatches' if pop_matches else ''
        return self.get(f'/api/core/players/{shard}/{key}?{params}')

    def test_get_player(self):
        player = self.get_player(shard=self.SHARD, key=self.PLAYER_NAME)
        self.check_dict(player, name=self.PLAYER_NAME)

        # Make sure getting by ID returns the same thing
        self.assertEqual(player, self.get_player(shard=self.SHARD, key=player['id']))

    def test_player_match(self):
        player = self.get_player(shard=self.SHARD, key=self.PLAYER_NAME)
        matches = player['matches']
        self.assertEqual(3, len(matches))
        match = matches[0]

        self.check_dict(
            match,
            match_id='5cf3ed16-6383-4172-bb60-8ead540d1245',
            roster=[
                {'player_id': 'account.a36bed11ed214557b0ddef9ef1a56d07',
                 'player_name': 'BreaK'},
                {'player_id': 'account.3dccfecabd8b442aba349136e2751c1d',
                 'player_name': 'rawryy'},
                {'player_id': 'account.e890ba1dda24475e9d55990c66ccc1c8',
                 'player_name': 'aimPR'},
                {'player_id': 'account.fdea0890724e410dbe298cee7e3abede',
                 'player_name': 'VissGames'},
            ],
        )
        self.check_dict(
            match['summary'],
            shard=self.SHARD,
            mode='squad',
            perspective='fpp',
            map_name='Savage_Main',
            date='2018-07-11T12:46:57-04:00',
            duration=1380,
            custom_match=False,
            roster_count=28,
        )
        self.check_dict(
            match['stats'],
            assists=0,
            boosts=5,
            damage_dealt=1366.98792,
            dbnos=8,
            death_type='byplayer',
            headshot_kills=3,
            heals=2,
            kill_place=1,
            kill_points=1407,
            kill_streaks=3,
            kills=13,  # What a hoss
            longest_kill=346.3509,
            most_damage=0,
            revives=2,
            ride_distance=0.0,
            road_kills=0,
            swim_distance=0.0,
            team_kills=0,
            time_survived=1372.279,
            vehicle_destroys=0,
            walk_distance=3766.725,
            weapons_acquired=4,
            win_place=2,
            win_points=1527,
        )

    def test_matches_sorted(self):
        # Make sure all matches are sorted by date
        player = self.get_player(shard=self.SHARD, key=self.PLAYER_NAME)
        self.check_sorted(player['matches'], key=lambda m: m['summary']['date'], reverse=True)

    def test_pop_matches(self):
        # Don't populate matches, all summaries are None
        matches = self.get_player(self.SHARD, self.PLAYER_NAME, pop_matches=False)['matches']
        self.assertEqual(3, len(matches))
        self.assertTrue(all(not m['summary'] for m in matches))

        # Populate matches, all summaries should be populated
        matches = self.get_player(self.SHARD, self.PLAYER_NAME, pop_matches=True)['matches']
        self.assertEqual(3, len(matches))
        self.assertTrue(all(m['summary'] for m in matches))
