from django.conf import settings
from django.db import models

from . import constants, devapi
from .query import DevAPIManager

api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


"""
There's 4 main model components - Match, RosterMatch, PlayerMatch, Player
    - A Match has multiple RosterMatches
    - A RosterMatch has multiple PlayerMatches
    - A PlayerMatch has one Player
    - A Player has multiple PlayerMatches

This forms a "two-ended" model, with one end being the matches and the other end being the players:
                                   ---|
MATCH---ROSTER_MATCH---PLAYER_MATCH---PLAYER
    |              |---PLAYER_MATCH---PLAYER
    |
    |---ROSTER_MATCH---PLAYER_MATCH---PLAYER
                   |---PLAYER_MATCH---PLAYER
                                   ---|
(I can't believe I actually spent time documenting my models with ASCII art)

This can be populated from both ends: by pulling data on a match, or by pulling data on a player.

If you pull match data, then it will populate the Match, all corresponding RosterMatches and
PlayerMatches, but the Player objects will not be pulled. If a Player is already in the DB, then
the Player object will be linked to the PlayerMatch object. An unlinked PlayerMatch in this case
will have a null reference to:
    - Its Player

If you pull player data, it will populate all PlayerMatch objects (or link to existing PlayerMatch)
objects where possible. An unlinked in this case PlayerMatch will have a null reference to:
    - Its RosterMatch
    - Its stats object
"""


class Match(models.Model):
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=constants.MATCH_ID_LENGTH)
    shard = models.CharField(max_length=20)
    mode = models.CharField(max_length=20)
    map_name = models.CharField(max_length=50)
    date = models.DateTimeField()
    duration = models.PositiveSmallIntegerField()
    telemetry_url = models.URLField()


class Player(models.Model):
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=constants.PLAYER_ID_LENGTH)
    name = models.CharField(max_length=50)
    shard = models.CharField(max_length=20)


class Telemetry(models.Model):
    objects = DevAPIManager()

    match = models.OneToOneField(Match, on_delete=models.CASCADE, primary_key=True)
    # TODO: Add events and stuff


class RosterMatch(models.Model):
    id = models.CharField(primary_key=True, max_length=constants.ROSTER_ID_LENGTH)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='rosters')
    placement = models.PositiveSmallIntegerField()


class PlayerMatch(models.Model):
    # Store the player's ID, and also a reference to the player object
    player_id = models.CharField(max_length=constants.PLAYER_ID_LENGTH)
    # Null if match isn't in the DB yet
    player_ref = models.ForeignKey(Player, on_delete=models.CASCADE, null=True,
                                   related_name='matches')
    match_id = models.CharField(max_length=36)
    # Null if match isn't in the DB yet
    roster_match = models.ForeignKey(RosterMatch, on_delete=models.CASCADE, null=True,
                                     related_name='players')

    class Meta:
        unique_together = ('player_id', 'match_id')


# This object will only be create when a PlayerMatch is populated from the Match side
class PlayerMatchStats(models.Model):
    player_match = models.OneToOneField(PlayerMatch, on_delete=models.CASCADE, primary_key=True,
                                        related_name='stats')
    kills = models.PositiveSmallIntegerField()
    # TODO: Add more stats
