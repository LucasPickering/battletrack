from django.db import models
from model_utils.managers import InheritanceManager

from btcore.models import api, Match, PlayerMatch
from btcore.query import DevAPIManager

from .fields import CircleField, PositionField


# Dict that stores event name (e.g. 'LogPlayerKill') and corresponding model. Populated by the
# decorator below, to be used on each model class.
_EVENT_MODELS = {}


def event_model(*names):
    """
    @brief      Decorator to register a class as a deserializer for a particular event type. Takes
                an event type string, e.g. 'LogPlayerKill'.

    @param      name  the event type
    """
    def inner(cls):
        for name in names:
            if name in _EVENT_MODELS:
                raise ValueError(f"Cannot register {cls} under {name}: Name already in use")
            _EVENT_MODELS[name] = cls
        return cls
    return inner


def get_event_model(event_type):
    return _EVENT_MODELS[event_type]


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

        @return     Dict of match ID and telemetry data from the API.
        """
        match_obj = Match.objects.get(id=match)  # Will pull from the API if necessary
        return {
            'match_id': match,  # Include match ID in output
            'telemetry': api.get(match_obj.telemetry_url),  # Pull the data from the API
        }


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
    objects = InheritanceManager()

    telemetry = models.ForeignKey(Telemetry, on_delete=models.CASCADE, related_name='events')
    type = models.CharField(max_length=20)
    time = models.DateTimeField()


@event_model('LogGameStatePeriodic')
class GameStatePeriodicEvent(Event):
    # God bless America
    red_zone = CircleField(blank=True)  # Blank if no active red zone
    white_zone = CircleField(blank=True)  # Blank if no white zone yet
    blue_zone = CircleField()


class PlayerEvent(Event):
    player = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE)
    position = PositionField()
    health = models.FloatField()


class PlayerAttackEvent(PlayerEvent):
    attack_type = models.CharField(max_length=20)
    weapon = models.OneToOneField(Item, on_delete=models.PROTECT)
    vehicle = models.OneToOneField(Vehicle, on_delete=models.PROTECT)


class PlayerTakeDamageEvent(PlayerEvent):
    attacker = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE,
                                 blank=True, null=True)  # Null if non-player damage
    damage = models.FloatField()
    damage_type = models.CharField(max_length=40)  # e.g. Damage_Gun
    damage_reason = models.CharField(max_length=40)  # e.g. ArmShot
    damage_causer = models.CharField(max_length=40)  # e.g. WeapHK416_C


class PlayerKillEvent(PlayerEvent):
    attacker = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE,
                                 blank=True)  # Null if non-player death
    damage_type = models.CharField(max_length=40)  # e.g. Damage_Gun
    damage_causer = models.CharField(max_length=40)  # e.g. WeapHK416_C


class ItemEvent(Event):
    player = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE)
    item = models.OneToOneField(Item, on_delete=models.PROTECT)
    position = PositionField()


class VehicleEvent(Event):
    player = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE)
    vehicle = models.OneToOneField(Vehicle, on_delete=models.PROTECT)


class VehicleDestroyEvent(VehicleEvent):
    attacker = models.ForeignKey(PlayerMatch, on_delete=models.CASCADE,
                                 blank=True)  # Null if destroyed by non-player damage


class CarePackageEvent(Event):
    position = PositionField()
