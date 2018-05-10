from django.db import models

from btcore.models import Match

from .fields import CircleField, PositionField, EventPlayerField, ItemField, VehicleField
from .query import TelemetryQuerySet


# Dict of evernt type to event model and model related name,
# e.g. 'VehicleRide':(VehicleEvent, 'vehicleevents')
# This can have duplicate values, because multiple event types can map to one model
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
            related_name = cls._meta.get_field('telemetry').related_query_name()
            _EVENT_MODELS[name] = (cls, related_name)

        return cls
    return inner


def get_event_model(event_type):
    return _EVENT_MODELS[event_type][0]


def get_event_related_name(event_type):
    return _EVENT_MODELS[event_type][1]


def get_all_event_related_names():
    return set(rn for model, rn in _EVENT_MODELS.values())  # De-dup


def get_all_event_models():
    return set(model for model, rn in _EVENT_MODELS.values())  # De-dup


class Telemetry(models.Model):
    objects = TelemetryQuerySet.as_manager()

    match = models.OneToOneField(Match, on_delete=models.CASCADE, primary_key=True)


# ABSTRACT EVENT MODELS

class AbstractEvent(models.Model):
    class Meta:
        abstract = True

    telemetry = models.ForeignKey(Telemetry, on_delete=models.CASCADE, related_name="%(class)ss")
    type = models.CharField(max_length=20)
    time = models.FloatField()


class AbstractPlayerEvent(AbstractEvent):
    class Meta:
        abstract = True

    player = EventPlayerField()


class AbstractPlayerVictimEvent(AbstractPlayerEvent):
    class Meta:
        abstract = True

    attacker = EventPlayerField(blank=True)  # Blank if non-player damage
    damage_type = models.CharField(max_length=40)  # e.g. Damage_Gun
    damage_causer = models.CharField(max_length=40)  # e.g. WeapHK416_C


class AbstractItemEvent(AbstractPlayerEvent):
    class Meta:
        abstract = True

    item = ItemField()


class AbstractVehicleEvent(AbstractPlayerEvent):
    class Meta:
        abstract = True

    vehicle = VehicleField()


# CONCRETE EVENT MODELS

@event_model('GameStatePeriodic')
class GameStatePeriodicEvent(AbstractEvent):
    # God bless America
    red_zone = CircleField(blank=True)  # Blank if no active red zone
    white_zone = CircleField(blank=True)  # Blank if no white zone yet
    blue_zone = CircleField()


@event_model('PlayerPosition')
class PlayerPositionEvent(AbstractPlayerEvent):
    pass  # This exists solely to be a concrete subclass


@event_model('PlayerAttack')
class PlayerAttackEvent(AbstractPlayerEvent):
    attack_type = models.CharField(max_length=20)
    weapon = ItemField()
    vehicle = VehicleField()


@event_model('PlayerKill')
class PlayerKillEvent(AbstractPlayerVictimEvent):
    pass


@event_model('PlayerTakeDamage')
class PlayerTakeDamageEvent(AbstractPlayerVictimEvent):
    damage = models.FloatField()
    damage_reason = models.CharField(max_length=40)  # e.g. ArmShot


@event_model('ItemPickup', 'ItemDrop', 'ItemEquip', 'ItemUnequip', 'ItemUse')
class ItemEvent(AbstractItemEvent):
    pass


@event_model('ItemAttach', 'ItemDetach')
class ItemAttachEvent(AbstractItemEvent):
    child_item = ItemField()


@event_model('VehicleRide', 'VehicleLeave')
class VehicleEvent(AbstractVehicleEvent):
    pass


@event_model('VehicleDestroy')
class VehicleDestroyEvent(AbstractVehicleEvent):
    attacker = EventPlayerField(blank=True)  # Blank if destroyed by non-player damage


@event_model('CarePackageSpawn', 'CarePackageLand')
class CarePackageEvent(AbstractEvent):
    pos = PositionField()
    # TODO: Add items
