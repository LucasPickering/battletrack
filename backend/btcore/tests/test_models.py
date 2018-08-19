from .common import BtTestCase, vcr
from btcore.models import Match, Player, PlayerMatch, RosterMatch


class DeletionTests(BtTestCase):

    MATCH_ID = '5cf3ed16-6383-4172-bb60-8ead540d1245'
    SHARD = 'pc-eu'
    PLAYER_NAME = 'BreaK'

    @vcr.use_cassette('match.yml')
    def get_match(self, id):
        return Match.objects.prefetch_related('rosters__players').get(id=id)

    @vcr.use_cassette('player.yml')
    def get_player(self, shard, name):
        return Player.objects.prefetch_related('matches').get(shard=shard, name=name)

    def setUp(self):
        self.match = self.get_match(self.MATCH_ID)
        self.player = self.get_player(self.SHARD, self.PLAYER_NAME)

    def test_delete_match_first(self):
        # Match---PM
        #      |--PM
        #      |--PM---Player
        #         PM--|
        #         PM--|

        roster_matches = self.match.rosters.all()
        rm_ids = [rm.id for rm in roster_matches]
        initial_pms_for_match = [pm for rm in roster_matches for pm in rm.players.all()]
        initial_pms_for_player = list(self.player.matches.all())

        # Delete the match and make sure it's gone
        self.match.delete()
        self.assertFalse(Match.objects.filter(id=self.MATCH_ID).exists(),
                         "Expected Match to be deleted")

        # Make sure all the RosterMatches are gone
        for rm_id in rm_ids:
            self.assertFalse(RosterMatch.objects.filter(id=rm_id).exists(),
                             "Expected all RosterMatches to be deleted")

        # Validate PlayerMatches for the Match
        # PlayerMatches with no Player linked should be gone
        # PlayerMatches linked to a Player should have been unlinked from their RosterMatches
        for old_pm in initial_pms_for_match:
            if Player.objects.filter(id=old_pm.player_id).exists():
                # RosterMatch link has been nulled out
                new_pm = PlayerMatch.objects.get(id=old_pm.id)
                self.assertIsNone(new_pm.roster_id)  # Roster has been unlinked
                self.assertEqual(old_pm.player_id, new_pm.player_id)  # Player ID is the same
            else:
                # PlayerMatch has been deleted
                self.assertRaises(PlayerMatch.DoesNotExist,
                                  lambda: PlayerMatch.objects.get(id=old_pm.id))

        # Validate PlayerMatches for the Player
        # All PlayerMatches still exist, with a null RosterMatch
        for old_pm in initial_pms_for_player:
            new_pm = PlayerMatch.objects.get(id=old_pm.id)
            self.assertIsNone(new_pm.roster_id)

        # Delete the player and make sure it's gone
        self.player.delete()
        self.assertFalse(Player.objects.filter(name=self.PLAYER_NAME).exists(),
                         "Expected Player to be deleted")

        # Make sure all the PlayerMatches are gone
        for pm in initial_pms_for_match + initial_pms_for_player:
            self.assertFalse(PlayerMatch.objects.filter(id=pm.id).exists(),
                             "Expected all PlayerMatches to be deleted")

    def test_delete_player_first(self):
        roster_matches = self.match.rosters.all()
        rm_ids = [rm.id for rm in roster_matches]
        initial_pms_for_match = [pm for rm in roster_matches for pm in rm.players.all()]
        initial_pms_for_player = list(self.player.matches.all())

        # Delete the player and make sure it's gone
        self.player.delete()
        self.assertFalse(Player.objects.filter(name=self.PLAYER_NAME).exists(),
                         "Expected Player to be deleted")

        # Validate PlayerMatches for the Player
        # PlayerMatches with no RosterMatch linked should be gone
        # PlayerMatches linked to a RosterMatch should be unchanged
        for old_pm in initial_pms_for_player:
            if RosterMatch.objects.filter(id=old_pm.roster_id).exists():
                new_pm = PlayerMatch.objects.get(id=old_pm.id)
                self.assertEqual(old_pm, new_pm)
            else:
                # PlayerMatch has been deleted
                self.assertRaises(PlayerMatch.DoesNotExist,
                                  lambda: PlayerMatch.objects.get(id=old_pm.id))

        # Validate PlayerMatches for the Match
        # All PlayerMatches still exist and are exactly the same
        for old_pm in initial_pms_for_match:
            new_pm = PlayerMatch.objects.get(id=old_pm.id)
            self.assertEqual(old_pm, new_pm)

        # Delete the match and make sure it's gone
        self.match.delete()
        self.assertFalse(Match.objects.filter(id=self.MATCH_ID).exists(),
                         "Expected Match to be deleted")

        # Make sure all the RosterMatches are gone
        for rm_id in rm_ids:
            self.assertFalse(RosterMatch.objects.filter(id=rm_id).exists(),
                             "Expected all RosterMatches to be deleted")

        # Make sure all the PlayerMatches are gone
        for pm in initial_pms_for_match + initial_pms_for_player:
            self.assertFalse(PlayerMatch.objects.filter(id=pm.id).exists(),
                             "Expected all PlayerMatches to be deleted")
