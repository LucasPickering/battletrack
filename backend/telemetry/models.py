from django.db import models
from model_utils.managers import InheritanceManager

from btcore.models import api, Match
from btcore.query import DevAPIManager

from .fields import CircleField, PositionField, EventPlayerField, ItemField, VehicleField


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


class Event(models.Model):
    objects = InheritanceManager()

    telemetry = models.ForeignKey(Telemetry, on_delete=models.CASCADE, related_name='events')
    type = models.CharField(max_length=20)
    time = models.FloatField()


@event_model('GameStatePeriodic')
class GameStatePeriodicEvent(Event):
    # God bless America
    red_zone = CircleField(blank=True)  # Blank if no active red zone
    white_zone = CircleField(blank=True)  # Blank if no white zone yet
    blue_zone = CircleField()


@event_model('PlayerPosition')
class PlayerEvent(Event):
    player = EventPlayerField()


@event_model('PlayerAttack')
class PlayerAttackEvent(PlayerEvent):
    attack_type = models.CharField(max_length=20)
    weapon = ItemField()
    vehicle = VehicleField()


@event_model('PlayerKill')
class PlayerVictimEvent(PlayerEvent):
    attacker = EventPlayerField(blank=True)  # Blank if non-player damage
    damage_type = models.CharField(max_length=40)  # e.g. Damage_Gun
    damage_causer = models.CharField(max_length=40)  # e.g. WeapHK416_C


@event_model('PlayerTakeDamage')
class PlayerTakeDamageEvent(PlayerVictimEvent):
    damage = models.FloatField()
    damage_reason = models.CharField(max_length=40)  # e.g. ArmShot


@event_model('ItemPickup', 'ItemDrop', 'ItemEquip', 'ItemUnequip', 'ItemUse')
class ItemEvent(PlayerEvent):
    item = ItemField()


@event_model('ItemAttach', 'ItemDetach')
class ItemAttachEvent(ItemEvent):
    child_item = ItemField()


@event_model('VehicleRide', 'VehicleLeave')
class VehicleEvent(PlayerEvent):
    vehicle = VehicleField()


@event_model('VehicleDestroy')
class VehicleDestroyEvent(VehicleEvent):
    attacker = EventPlayerField(blank=True)  # Blank if destroyed by non-player damage


@event_model('CarePackageSpawn', 'CarePackageLand')
class CarePackageEvent(Event):
    pos = PositionField()
    # TODO: Add items
