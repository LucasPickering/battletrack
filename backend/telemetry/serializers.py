from django.db import transaction
from rest_framework import serializers
from drf_writable_nested import NestedCreateMixin

from btcore.models import Match
from btcore.serializers import DevDeserializer

from . import models
from .fields import EventPlayer, Item, Vehicle, EventSerializerField


# A prefix at the beginning of each event type in the API data, this will be stripped
_EVENT_TYPE_PREFIX = 'Log'


def get_event_type(event):
    return event['_T'][len(_EVENT_TYPE_PREFIX):]  # Remove prefix from event type


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

    def get_events(self, obj):
        # Check for type filtering. None/empty means no filtering.
        types = self.context.get('types', None)
        if types:
            types = set(types)  # Convert to set for faster membership check

        # Iterate over each event (and convert each one from Event to the proper subclass)
        # Serializing events that match the filter
        return [
            event.serializer(event).data
            for event in obj.events.select_subclasses()
            if types is None or event.type in types
        ]

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
        for event in dev_data['telemetry']:
            typ = get_event_type(event)  # Remove prefix from event type

            # See if this is an event type we care about. If so, save it for later.
            try:
                # Get the event model class by type name, then get the serializer class from that
                event_serializer = models.get_event_model(typ).serializer
            except KeyError:
                continue  # We don't care about this event type, skip it
            events.append(event_serializer.convert_dev_data(event))

        return {
            'match': match_id,
            'events_write': events,
        }

    @transaction.atomic
    def create(self, validated_data):
        match_id = validated_data['match']
        events = validated_data['events_write']

        telemetry = models.Telemetry.objects.create(match_id=match_id)

        # Create and save each event
        for event in events:
            models.get_event_model(event['type']).objects.create(telemetry=telemetry, **event)

        return telemetry


class EventSerializer(DevDeserializer, NestedCreateMixin):
    class Meta:
        model = models.Event
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        # Convert Dev API-formatted data into our format
        return {
            'type': get_event_type(dev_data),
            'time': dev_data['_D'],
        }


class GameStatePeriodicEventSerializer(EventSerializer):
    red_zone = EventSerializerField()
    white_zone = EventSerializerField()
    blue_zone = EventSerializerField()

    class Meta:
        model = models.GameStatePeriodicEvent
        exclude = ('id', 'telemetry')

    @staticmethod
    def parse_circle(prefix, game_state):
        radius = game_state[prefix + 'Radius']

        # If radius is 0, return None
        if radius > 0:
            return {
                'pos': game_state[prefix + 'Position'],
                'radius': radius,
            }
        return None

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(GameStatePeriodicEventSerializer, cls).convert_dev_data(dev_data, **kwargs)
        game_state = dev_data['gameState']
        rv.update({
            'red_zone': cls.parse_circle('redZone', game_state),
            'white_zone': cls.parse_circle('poisonGasWarning', game_state),
            'blue_zone': cls.parse_circle('safetyZone', game_state),
        })
        return rv


class PlayerEventSerializer(EventSerializer):
    player = EventSerializerField()

    class Meta:
        model = models.PlayerEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, player_key='character', **kwargs):
        rv = super(PlayerEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'player': EventPlayer.convert_dev_data(dev_data[player_key])
        })
        return rv


class PlayerAttackEventSerializer(PlayerEventSerializer):
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


class PlayerVictimEventSerializer(PlayerEventSerializer):
    attacker = EventSerializerField()

    class Meta:
        model = models.PlayerVictimEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, attacker_key='killer', **kwargs):
        rv = super(PlayerVictimEventSerializer, cls).convert_dev_data(dev_data, player_key='victim',
                                                                      **kwargs)

        rv.update({
            'attacker': EventPlayer.convert_dev_data(dev_data[attacker_key]),
            'damage_type': dev_data['damageTypeCategory'],
            'damage_causer': dev_data['damageCauserName'],
        })
        return rv


class PlayerTakeDamageEventSerializer(PlayerVictimEventSerializer):
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


class ItemEventSerializer(PlayerEventSerializer):
    class Meta:
        model = models.ItemEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, item_key='item', **kwargs):
        rv = super(ItemEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'item': Item.convert_dev_data(dev_data[item_key]),
        })
        return rv


class ItemAttachEventSerializer(ItemEventSerializer):
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


class VehicleEventSerializer(PlayerEventSerializer):
    class Meta:
        model = models.VehicleEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(VehicleEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'vehicle': Vehicle.convert_dev_data(dev_data['vehicle']),
        })
        return rv


class VehicleDestroyEventSerializer(VehicleEventSerializer):
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


class CarePackageEventSerializer(EventSerializer):
    class Meta:
        model = models.CarePackageEvent
        exclude = ('id', 'telemetry')

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        rv = super(CarePackageEventSerializer, cls).convert_dev_data(dev_data, **kwargs)

        rv.update({
            'position': dev_data['itemPackage']['location'],
        })
        return rv
