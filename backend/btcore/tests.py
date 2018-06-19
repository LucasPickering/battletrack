from vcr import VCR

from django.test import TestCase

from .models import Match, Player

vcr = VCR(
    cassette_library_dir='fixtures',
    record_mode='new_episodes',
    match_on=['uri', 'method'],
    filter_headers=['Authorization'],
)
CASSETTE_FILE = 'cassette.yml'

MATCH_ID = 'd86e3e72-8c0e-4018-a79f-f15ece28ed89'
PLAYER_NAME = 'zdkdz'


class MatchTests(TestCase):
    @vcr.use_cassette(CASSETTE_FILE)
    def test_get_match(self):
        match = Match.objects.get(id=MATCH_ID)

        self.assertEqual(MATCH_ID, match.id)
        self.assertEqual('pc-na', match.shard)
        self.assertEqual('fpp', match.perspective)
        self.assertEqual('Erangel_Main', match.map_name)


class PlayerTests(TestCase):
    @vcr.use_cassette(CASSETTE_FILE)
    def test_get_player(self):
        player = Player.objects.get(shard='pc-na', name=PLAYER_NAME)

        self.assertEqual(PLAYER_NAME, player.name)
