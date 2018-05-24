from django.core.exceptions import ValidationError
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


class RelatedCacheModel(models.Model):
    class Meta:
        abstract = True

    def cache_related(self, field, *values):
        if not hasattr(self, '_prefetched_objects_cache'):
            self._prefetched_objects_cache = {}
        try:
            field_cache = self._prefetched_objects_cache[field]
            # If it isn't a list already, convert it to one
            if not isinstance(field_cache, list):
                field_cache = self._prefetched_objects_cache[field] = list(field_cache)
            self._prefetched_objects_cache[field] += values
        except KeyError:
            self._prefetched_objects_cache[field] = list(values)


class Match(RelatedCacheModel):
    objects = MatchQuerySet.as_manager()

    id = models.CharField(primary_key=True, max_length=util.MATCH_ID_LENGTH)
    shard = models.CharField(max_length=20, choices=util.choices(util.SHARDS))
    mode = models.CharField(max_length=10)
    perspective = models.CharField(max_length=10, choices=util.choices(util.PERSPECTIVES))
    map_name = models.CharField(max_length=50, choices=util.choices(util.MAPS.values()))
    date = models.DateTimeField()
    duration = models.PositiveSmallIntegerField()
    telemetry_url = models.URLField()


class Player(RelatedCacheModel):
    objects = PlayerQuerySet.as_manager()

    id = models.CharField(primary_key=True, max_length=util.PLAYER_ID_LENGTH)
    name = models.CharField(max_length=50, unique=True)


class RosterMatch(RelatedCacheModel):
    id = models.CharField(primary_key=True, max_length=util.ROSTER_ID_LENGTH)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='rosters')
    win_place = models.PositiveSmallIntegerField()


class PlayerMatch(RelatedCacheModel):
    # Null if match/player isn't in the DB yet
    roster = models.ForeignKey(RosterMatch, on_delete=models.SET_NULL, null=True,
                               related_name='players')
    player_ref = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True,
                                   related_name='matches')

    # Store these additional fields, because they can be gotten from match OR player data
    match_id = models.CharField(max_length=36)
    player_id = models.CharField(max_length=util.PLAYER_ID_LENGTH)
    player_name = models.CharField(max_length=30)
    shard = models.CharField(max_length=20, choices=util.choices(util.SHARDS))

    class Meta:
        unique_together = ('player_id', 'match_id')

    def clean(self):
        super().clean()
        # Make sure at least one of player/roster is set
        if self.player_ref is None and self.roster is None:
            raise ValidationError("No player or roster set")


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
    longest_kill = models.PositiveSmallIntegerField()
    most_damage = models.PositiveSmallIntegerField()
    revives = models.PositiveSmallIntegerField()
    ride_distance = models.FloatField()
    road_kills = models.PositiveSmallIntegerField()
    team_kills = models.PositiveSmallIntegerField()
    time_survived = models.PositiveSmallIntegerField()
    vehicle_destroys = models.PositiveSmallIntegerField()
    walk_distance = models.FloatField()
    weapons_acquired = models.PositiveSmallIntegerField()
    win_place = models.PositiveSmallIntegerField()
    win_points = models.PositiveSmallIntegerField()
