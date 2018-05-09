import dateutil.parser
import itertools
import time
from collections import defaultdict

from django.db import transaction
from rest_framework import serializers
from drf_writable_nested import NestedCreateMixin

from btcore.models import Match
from btcore.serializers import DevDeserializer

from . import models
from .fields import Position, Circle, EventPlayer, Item, Vehicle, EventSerializerField


# A prefix at the beginning of each event type in the API data, this will be stripped
_EVENT_TYPE_PREFIX = 'Log'


def get_event_type(event):
    """
    @brief      Gets the event type, without the common prefix (which was 'Log' when I wrote this)

    @param      event  The event

    @return     The event type, with the prefix removed
    """
    return event['_T'][len(_EVENT_TYPE_PREFIX):]  # Remove prefix from event type


def get_event_time(event, start_time=None):
    """
    @brief      Gets the event time relative to the start time of the match. If no start time is
                specified, the time is returned as an absolute datetime object.

    @param      event       The event
    @param      start_time  The start time of the match, as a datetime object

    @return     The event time, in seconds (float)
    """
    dt = dateutil.parser.parse(event['_D'])

    # If start time is defined, caluculate difference from start
    if start_time:
        delta = dt - start_time
        return delta.total_seconds()
    return dt  # Otherwise just return the time


class TelemetrySerializer(DevDeserializer):
    match = serializers.PrimaryKeyRelatedField(queryset=Match.objects)
    events = serializers.SerializerMethodField()

    class Meta:
        model = models.Telemetry
        fields = ('match', 'events')
        extra_kwargs = {
            'events_write': {'write_only': True},
        }

    def run_validation(self, data):
        return data  # Frigg off Mr. Lahey

    def get_events(self, telemetry):
        # Check for type filtering. None/empty means no filtering.
        types = self.context.get('types', None)

        # Figure out which event types to fetch
        if types is None:
            event_rns = models.get_all_event_related_names()
        else:
            event_rns = set(models.get_event_related_name(typ) for typ in types)  # De-dup

        # Fetch all events from the DB by getting a QuerySet for each one and chaining them
        events = itertools.chain.from_iterable(getattr(telemetry, related_name).all()
                                               for related_name in event_rns)

        sorted_events = sorted(events, key=lambda e: e.time)  # Sort by time (takes ~1.5s tops)

        # Serialize each event
        return [event.serializer(event).data for event in sorted_events]

    @staticmethod
    def parse_player_create(event):
        char = event['character']
        return {
            'id': char['accountId'],
            'name': char['name'],
        }

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        match_id = dev_data['match_id']

        # Parse each event
        events = []
        dev_events = dev_data['telemetry']

        # Track the time of the actual match start, marked by the LogMatchStart event. All events
        # before match start will be ignored.
        start_time = None

        for event in dev_events:
            typ = get_event_type(event)  # Remove prefix from event type

            # Special case for match start
            if typ == 'MatchStart':
                start_time = get_event_time(event)
            elif typ == 'MatchEnd':
                # Skip the extra events after the game ends
                break

            # If start time hasn't been defined yet, this event is from the lobby so we don't care
            if start_time:
                # See if this is an event type we care about. If so, save it for later.
                try:
                    # Get the event model class by type name, then get the serializer class
                    event_serializer = models.get_event_model(typ).serializer
                except KeyError:
                    continue  # We don't care about this event type, skip it
                events.append(event_serializer.convert_dev_data(event, start_time=start_time))

        return {
            'match': match_id,
            'events_write': events,
        }

    @transaction.atomic
    def create(self, validated_data):
        match_id = validated_data['match']
        events = validated_data['events_write']

        telemetry = models.Telemetry.objects.create(match_id=match_id)

        # Group events by type
        events_by_type = defaultdict(list)
        for event in events:
            events_by_type[event['type']].append(event)

        # Regroup events by model (multiple types can map to one model, so we want to reduce that)
        events_by_model = defaultdict(list)
        for typ, subevents in events_by_type.items():
            events_by_model[models.get_event_model(typ)] += subevents

        # Create every event, with one bulk_create for each model
        for model, subevents in events_by_model.items():
            model.objects.bulk_create(
                model(telemetry=telemetry, **event) for event in subevents
            )

        return telemetry


# ABSTRACT EVENT SERIALIZERS

class AbstractEventSerializer(DevDeserializer, NestedCreateMixin):
    @classmethod
    def convert_dev_data(cls, dev_data, start_time, **kwargs):
        # Convert Dev API-formatted data into our format
        return {
            'type': get_event_type(dev_data),
            'time': get_event_time(dev_data, start_time=start_time),
        }


class AbstractPlayerEventSerializer(AbstractEventSerializer):
    player = EventSerializerField()

    @classmethod
    def convert_dev_data(cls, dev_data, player_key='character', **kwargs):
        rv = super(AbstractPlayerEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'player': EventPlayer.convert_dev_data(dev_data[player_key])
        })
        return rv


class AbstractPlayerVictimEventSerializer(AbstractPlayerEventSerializer):
    attacker = EventSerializerField()

    @classmethod
    def convert_dev_data(cls, dev_data, attacker_key='killer', **kwargs):
        rv = super(AbstractPlayerVictimEventSerializer, cls).convert_dev_data(dev_data,
                                                                              player_key='victim',
                                                                              **kwargs)

        rv.update({
            'attacker': EventPlayer.convert_dev_data(dev_data[attacker_key]),
            'damage_type': dev_data['damageTypeCategory'],
            'damage_causer': dev_data['damageCauserName'],
        })
        return rv


class AbstractItemEventSerializer(AbstractPlayerEventSerializer):
    item = EventSerializerField()

    @classmethod
    def convert_dev_data(cls, dev_data, item_key='item', **kwargs):
        rv = super(AbstractItemEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'item': Item.convert_dev_data(dev_data[item_key]),
        })
        return rv


class AbstractVehicleEventSerializer(AbstractPlayerEventSerializer):
    vehicle = EventSerializerField()

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(AbstractVehicleEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'vehicle': Vehicle.convert_dev_data(dev_data['vehicle']),
        })
        return rv


# CONCRETE EVENT SERIALIZERS

class GameStatePeriodicEventSerializer(AbstractEventSerializer):
    red_zone = EventSerializerField()
    white_zone = EventSerializerField()
    blue_zone = EventSerializerField()

    class Meta:
        model = models.GameStatePeriodicEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(GameStatePeriodicEventSerializer, cls).convert_dev_data(dev_data, **kwargs)
        game_state = dev_data['gameState']
        rv.update({
            'red_zone': Circle.convert_dev_data(game_state['redZoneRadius'],
                                                game_state['redZonePosition']),
            'white_zone': Circle.convert_dev_data(game_state['poisonGasWarningRadius'],
                                                  game_state['poisonGasWarningPosition']),
            'blue_zone': Circle.convert_dev_data(game_state['safetyZoneRadius'],
                                                 game_state['safetyZonePosition']),
        })
        return rv


class PlayerPositionEventSerializer(AbstractPlayerEventSerializer):
    class Meta:
        model = models.PlayerPositionEvent
        exclude = ('id', 'telemetry')


class PlayerAttackEventSerializer(AbstractPlayerEventSerializer):
    weapon = EventSerializerField()
    vehicle = EventSerializerField()

    class Meta:
        model = models.PlayerAttackEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(PlayerAttackEventSerializer, cls).convert_dev_data(dev_data,
                                                                      player_key='attacker',
                                                                      **kwargs)

        rv.update({
            'attack_type': dev_data['attackType'],
            'weapon': Item.convert_dev_data(dev_data['weapon']),
            'vehicle': Vehicle.convert_dev_data(dev_data['vehicle']),
        })
        return rv


class PlayerKillEventSerializer(AbstractPlayerVictimEventSerializer):
    class Meta:
        model = models.PlayerKillEvent
        exclude = ('id', 'telemetry')


class PlayerTakeDamageEventSerializer(AbstractPlayerVictimEventSerializer):
    class Meta:
        model = models.PlayerTakeDamageEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(PlayerTakeDamageEventSerializer, cls).convert_dev_data(dev_data,
                                                                          attacker_key='attacker',
                                                                          **kwargs)

        rv.update({
            'damage': dev_data['damage'],
            'damage_reason': dev_data['damageReason'],
        })
        return rv


class ItemEventSerializer(AbstractItemEventSerializer):
    class Meta:
        model = models.ItemEvent
        exclude = ('id', 'telemetry')


class ItemAttachEventSerializer(AbstractItemEventSerializer):
    child_item = EventSerializerField()

    class Meta:
        model = models.ItemAttachEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(ItemAttachEventSerializer, cls).convert_dev_data(dev_data,
                                                                    item_key='parentItem',
                                                                    **kwargs)

        rv.update({
            'child_item': Item.convert_dev_data(dev_data['childItem']),
        })
        return rv


class VehicleEventSerializer(AbstractVehicleEventSerializer):
    class Meta:
        model = models.VehicleEvent
        exclude = ('id', 'telemetry')


class VehicleDestroyEventSerializer(AbstractVehicleEventSerializer):
    attacker = EventSerializerField()

    class Meta:
        model = models.VehicleDestroyEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(VehicleDestroyEventSerializer, cls).convert_dev_data(dev_data,
                                                                        player_key='attacker',
                                                                        **kwargs)

        rv.update({
            'attacker': EventPlayer.convert_dev_data(dev_data['attacker']),
        })
        return rv


class CarePackageEventSerializer(AbstractEventSerializer):
    pos = EventSerializerField()

    class Meta:
        model = models.CarePackageEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(CarePackageEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'pos': Position.convert_dev_data(dev_data['itemPackage']['location']),
        })
        return rv
