from django.db import models

from . import util
from .query import MatchQuerySet, PlayerQuerySet


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
    objects = MatchQuerySet.as_manager()

    id = models.CharField(primary_key=True, max_length=util.MATCH_ID_LENGTH)
    shard = models.CharField(max_length=20)
    mode = models.CharField(max_length=20)
    perspective = models.CharField(max_length=10, blank=True)  # Blank for custom games
    map_name = models.CharField(max_length=50, choices=util.choices(util.MAP_SIZES.keys()))
    date = models.DateTimeField()
    duration = models.PositiveSmallIntegerField()
    custom_match = models.BooleanField()
    telemetry_url = models.URLField()


class Player(models.Model):
    objects = PlayerQuerySet.as_manager()

    id = models.CharField(primary_key=True, max_length=util.PLAYER_ID_LENGTH)
    name = models.CharField(max_length=50, unique=True)


class RosterMatch(models.Model):
    id = models.CharField(primary_key=True, max_length=util.ROSTER_ID_LENGTH)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='rosters')
    win_place = models.PositiveSmallIntegerField()


class PlayerMatch(models.Model):
    # Null if match/player isn't in the DB yet
    roster = models.ForeignKey(RosterMatch, on_delete=models.SET_NULL, null=True,
                               related_name='players')
    player = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, db_constraint=False,
                               related_name='matches')

    # Store these additional fields, because they can be gotten from match OR player data
    match_id = models.CharField(max_length=36)
    player_name = models.CharField(max_length=30)
    shard = models.CharField(max_length=20)

    class Meta:
        unique_together = ('roster', 'player')


# This object will only be create when a PlayerMatch is populated from the Match side
class PlayerMatchStats(models.Model):
    player_match = models.OneToOneField(PlayerMatch, on_delete=models.CASCADE, primary_key=True,
                                        related_name='stats')
    assists = models.PositiveSmallIntegerField()
    boosts = models.PositiveSmallIntegerField()
    damage_dealt = models.FloatField()
    dbnos = models.PositiveSmallIntegerField()
    death_type = models.CharField(max_length=20)
    headshot_kills = models.PositiveSmallIntegerField()
    heals = models.PositiveSmallIntegerField()
    kill_place = models.PositiveSmallIntegerField()
    kill_points = models.PositiveSmallIntegerField()
    kill_streaks = models.PositiveSmallIntegerField()
    kills = models.PositiveSmallIntegerField()
    longest_kill = models.FloatField()
    most_damage = models.PositiveSmallIntegerField()
    revives = models.PositiveSmallIntegerField()
    ride_distance = models.FloatField()
    swim_distance = models.FloatField()
    road_kills = models.PositiveSmallIntegerField()
    team_kills = models.PositiveSmallIntegerField()
    time_survived = models.FloatField()
    vehicle_destroys = models.PositiveSmallIntegerField()
    walk_distance = models.FloatField()
    weapons_acquired = models.PositiveSmallIntegerField()
    win_place = models.PositiveSmallIntegerField()
    win_points = models.PositiveSmallIntegerField()
