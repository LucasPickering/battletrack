import dateutil.parser
from collections import defaultdict
from itertools import chain

from django.db import transaction
from rest_framework import serializers

from btcore.models import Match
from btcore.serializers import DevDeserializer, MatchSummarySerializer

from . import models
from .fields import Position3, Circle, Ray, EventPlayer, Item, Vehicle, EventSerializerField, \
    EventListSerializerField


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


class EventsSerializer(serializers.ListField):
    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        # Parse each event
        events = []

        # Track the time of the actual match start, marked by the MatchStart event. All events
        # before match start will be ignored.
        start_time = None

        for event in dev_data:
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
                    event_serializer = models.get_event_model(typ).model.serializer
                except KeyError:
                    continue  # We don't care about this event type, skip it
                events.append(event_serializer.convert_dev_data(event, start_time=start_time))
        return events

    def run_validation(self, data):
        return {'events': data}  # Wrap the list in a dict to make DRF happy

    def to_representation(self, telemetry):
        # Check for type filtering. None means no filtering, empty string means filter all.
        types_str = self.context.get('events')

        # Build a dict of EventModelTuple:QuerySet, where the QuerySet contains all relevant
        # objects of that event model. The key tuple contains (model, related_name), and these
        # are accessible by those names. The dict will be used to build one serializer for each
        # entry.
        if types_str is None:
            # No filtering, just get every model's events
            events = {mt: getattr(telemetry, mt.related_name).all()
                      for mt in models.get_all_event_models()}
        else:
            # Decide which models we care about, and which types we want for each model.
            # We may want to get only one type of many for a model, so this will allow us to filter
            # on the type(s) we care about.
            types = filter(None, types_str.split(','))  # Filter out empty string
            models_to_types = defaultdict(set)
            for typ in types:
                models_to_types[models.get_event_model(typ)].add(typ)

            # For each model we want, get all the objects of the type(s) we want.
            events = {mt: getattr(telemetry, mt.related_name).filter(type__in=mt_types)
                      for mt, mt_types in models_to_types.items()}

        # Create one serializer per model, for all events of that model. Then, chain all the
        # outputs together to get one long iterable of serialized events.
        serialized_events = chain.from_iterable(mt.model.serializer(mt_events, many=True).data
                                                for mt, mt_events in events.items())

        # Separate serialized events by type (NOT by model - there can be multiple types per model)
        events_by_type = defaultdict(list)
        for event in serialized_events:
            events_by_type[event['type']].append(event)
        return events_by_type


class TelemetrySerializer(DevDeserializer):
    # Read as a full object, write just as an ID
    match = MatchSummarySerializer(read_only=True)
    match_write = serializers.PrimaryKeyRelatedField(queryset=Match.objects, write_only=True)

    events = EventsSerializer(source='*', read_only=False)
    # "Read-only" fields because they aren't included in validated data - they are generated during
    # creation time. They never appear in the data pre-deserialization.
    plane = EventSerializerField(read_only=True)
    zones = EventListSerializerField(read_only=True)

    class Meta:
        model = models.Telemetry
        fields = ('match', 'match_write', 'plane', 'zones', 'events')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        return {
            'match_write': dev_data['match_id'],
            'events': EventsSerializer.convert_dev_data(dev_data['telemetry'], **kwargs),
        }

    @staticmethod
    def _calc_plane(vehicle_leave_events):
        # Draw a line between the first and last players to leave the plane
        plane_events = list(filter(lambda e: e['vehicle']['type'] == 'TransportAircraft',
                                   vehicle_leave_events))
        first, last = plane_events[0], plane_events[-1]
        return Ray.from_dict({
            'start': first['player']['pos'],
            'end': last['player']['pos'],
        })

    @staticmethod
    def _calc_zones(zone_events):
        last_white = None
        rv = []

        # Every time the white zone changes, store the new value
        for event in zone_events:
            white = event['white_zone']
            if white and white != last_white:
                rv.append(Circle.from_dict(white))
                last_white = white
        return rv

    @transaction.atomic
    def create(self, validated_data):
        match = validated_data['match_write']  # Match object
        events = validated_data['events']  # List of event dicts

        # Group events by type
        events_by_type = defaultdict(list)
        for event in events:
            events_by_type[event['type']].append(event)

        # Get extra game data from parsed events
        plane = self._calc_plane(events_by_type['VehicleLeave'])
        zones = self._calc_zones(events_by_type['GameStatePeriodic'])

        # Create models
        telemetry = models.Telemetry.objects.create(match=match, plane=plane, zones=zones)

        # Regroup events by model (multiple types can map to one model, so we want to reduce that)
        events_by_model = defaultdict(list)
        for typ, subevents in events_by_type.items():
            events_by_model[models.get_event_model(typ).model] += subevents

        # Create every event, with one bulk_create for each model
        for model, subevents in events_by_model.items():
            model.objects.bulk_create(
                model(telemetry=telemetry, **event) for event in subevents
            )

        return telemetry


# ABSTRACT EVENT SERIALIZERS

class AbstractEventSerializer(DevDeserializer):
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
    items = EventListSerializerField()

    class Meta:
        model = models.CarePackageEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(CarePackageEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'pos': Position3.convert_dev_data(dev_data['itemPackage']['location']),
            'items': [Item.convert_dev_data(i) for i in dev_data['itemPackage']['items']],
        })
        return rv
