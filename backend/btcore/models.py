from django.conf import settings
from django.db import models

from . import devapi, util
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
    get_from_api = api.get_match
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=util.MATCH_ID_LENGTH)
    shard = models.CharField(max_length=20)
    mode = models.CharField(max_length=10, choices=util.GAME_MODES)
    perspective = models.CharField(max_length=10, choices=util.PERSPECTIVES)
    map_name = models.CharField(max_length=50)
    date = models.DateTimeField()
    duration = models.PositiveSmallIntegerField()
    telemetry_url = models.URLField()


class Player(models.Model):
    get_from_api = api.get_player
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=util.PLAYER_ID_LENGTH)
    name = models.CharField(max_length=50)
    shard = models.CharField(max_length=20)


class Telemetry(models.Model):
    objects = DevAPIManager()

    match = models.OneToOneField(Match, on_delete=models.CASCADE, primary_key=True)

    @staticmethod
    def get_from_api(match):
        """
        @brief      Gets telemetry data from the dev API, given a match ID. Looks up the match by
                    ID in the DB, which will fetch it from the API if necessary. Then, gets the
                    telemetry URL from the match data and fetches that from the API.

        @param      match  The match ID

        @return     The telemetry data from the API.
        """
        # Get the match object. This will fetch it from the API if necessary.
        match_obj = Match.objects.get(id=match)
        tel_data = api.get(match_obj.telemetry_url)  # Get the URL
        return {'match': match_obj, 'telemetry': tel_data}


class RosterMatch(models.Model):
    id = models.CharField(primary_key=True, max_length=util.ROSTER_ID_LENGTH)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='rosters')
    win_place = models.PositiveSmallIntegerField()


class PlayerMatch(models.Model):
    # Store the player's ID and name, because those can be gotten from match/telemetry object
    player_id = models.CharField(max_length=util.PLAYER_ID_LENGTH)
    player_name = models.CharField(max_length=30)
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
    ride_distance = models.PositiveSmallIntegerField()
    road_kills = models.PositiveSmallIntegerField()
    team_kills = models.PositiveSmallIntegerField()
    time_survived = models.PositiveSmallIntegerField()
    vehicle_destroys = models.PositiveSmallIntegerField()
    walk_distance = models.FloatField()
    weapons_acquired = models.PositiveSmallIntegerField()
    win_place = models.PositiveSmallIntegerField()
    win_points = models.PositiveSmallIntegerField()


class Position(models.Model):
    """
    @brief      Describes a 3D position
    """
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()


class Circle(models.Model):
    """
    @brief      Describes a circle's (red zone, white zone, etc.) position and radius.
    """
    position = models.OneToOneField(Position, on_delete=models.PROTECT)
    radius = models.FloatField()


class Item(models.Model):
    item_name = models.CharField(max_length=75)
    stack_count = models.PositiveSmallIntegerField()
    category = models.CharField(max_length=20)
    subcategory = models.CharField(max_length=20)


class Vehicle(models.Model):
    vehicle_type = models.CharField(max_length=40)
    vehicle_name = models.CharField(max_length=40)
    health = models.FloatField()
    fuel = models.FloatField()


class Event(models.Model):
    telemetry = models.ForeignKey(Telemetry, on_delete=models.CASCADE)
    type = models.CharField(max_length=20)
    time = models.DateTimeField()


class GameStatePeriodicEvent(Event):
    # God bless America
    red_zone = models.OneToOneField(Circle, on_delete=models.PROTECT, related_name='red_event',
                                    blank=True, )  # Null if no active red zone
    white_zone = models.OneToOneField(Circle, on_delete=models.PROTECT, related_name='white_event')
    blue_zone = models.OneToOneField(Circle, on_delete=models.PROTECT, related_name='blue_event')


class PlayerEvent(Event):
    # player = PlayerMatchField()
    position = models.OneToOneField(Position, on_delete=models.PROTECT)
    health = models.FloatField()


class PlayerAttackEvent(Event):
    attack_type = models.CharField(max_length=20)
    weapon = models.OneToOneField(Item, on_delete=models.PROTECT)
    vehicle = models.OneToOneField(Vehicle, on_delete=models.PROTECT)


class PlayerTakeDamageEvent(Event):
    attacker = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE,
                                 blank=True)  # Null if non-player damage
    damage = models.FloatField()
    damage_type = models.CharField(max_length=40)  # e.g. Damage_Gun
    damage_reason = models.CharField(max_length=40)  # e.g. ArmShot
    damage_causer = models.CharField(max_length=40)  # e.g. WeapHK416_C


class PlayerKillEvent(Event):
    attacker = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE,
                                 blank=True)  # Null if non-player death
    damage_type = models.CharField(max_length=40)  # e.g. Damage_Gun
    damage_causer = models.CharField(max_length=40)  # e.g. WeapHK416_C


class ItemEvent(Event):
    player = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE)
    item = models.OneToOneField(Item, on_delete=models.PROTECT)
    position = models.OneToOneField(Position, on_delete=models.PROTECT)


class VehicleEvent(Event):
    player = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE)
    vehicle = models.OneToOneField(Vehicle, on_delete=models.PROTECT)


class VehicleDestroyEvent(VehicleEvent):
    attacker = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE,
                                 blank=True)  # Null if destroyed by non-player damage


class CarePackageEvent(Event):
    position = models.OneToOneField(Position, on_delete=models.PROTECT)
