from django.conf import settings
from django.db import models

from . import devapi
from .query import DevAPIManager

api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


class Match(models.Model):
    api_getter = api.get_match  # Specify method to fetch match from API
    # See MatchSerializer for the method that deserializes dev API data
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=100)
    shard = models.CharField(max_length=20)
    mode = models.CharField(max_length=20)
    map_name = models.CharField(max_length=50)
    date = models.DateTimeField()
    duration = models.PositiveSmallIntegerField()
    telemetry_url = models.URLField()


class Telemetry(models.Model):
    api_getter = api.get_telemetry

    url = models.URLField()
    match = models.OneToOneField(Match, on_delete=models.CASCADE, primary_key=True)


class Player(models.Model):
    api_getter = api.get_player
    # See PlayerSerializer for the method that deserializes dev API data
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=50)
    shard = models.CharField(max_length=20)


class RosterMatch(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    placement = models.PositiveSmallIntegerField()


class PlayerMatch(models.Model):
    # Store the player's ID, and also a reference to the player object
    player_id = models.CharField(max_length=40)
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
