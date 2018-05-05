from django.db import transaction
from rest_framework import serializers
from drf_writable_nested import NestedCreateMixin

from btcore.models import Match
from btcore.serializers import DevDeserializer

from . import models
from .fields import CircleSerializerField, PositionSerializerField


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
        # Iterate over each event (and convert each one from Event to the proper subclass)
        return [
            event.serializer(event).data
            for event in obj.events.all().select_subclasses()
        ]

    @staticmethod
    def parse_player_create(event):
        char = event['character']
        return {
            'id': char['accountId'],
            'name': char['name'],
        }

    @classmethod
    def convert_dev_data(cls, dev_data):
        # Parse each event
        events = []
        for event in dev_data['telemetry']:
            typ = event['_T']

            # See if this is an event type we care about. If so, save it for later.
            try:
                # Get the event model class by type name, then get the serializer class from that
                event_serializer = models.get_event_model(typ).serializer
            except KeyError:
                continue  # We don't care about this event type, skip it
            events.append(event_serializer.convert_dev_data(event))

        return {
            'match': dev_data['match_id'],
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
    def convert_dev_data(cls, dev_data):
        # Convert Dev API-formatted data into our format
        return {
            'type': dev_data['_T'],
            'time': dev_data['_D'],
        }


class GameStatePeriodicEventSerializer(EventSerializer):
    red_zone = CircleSerializerField()
    white_zone = CircleSerializerField()
    blue_zone = CircleSerializerField()

    class Meta:
        model = models.GameStatePeriodicEvent
        exclude = ('id',)

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
    def convert_dev_data(cls, dev_data):
        rv = super(cls, cls).convert_dev_data(dev_data)
        game_state = dev_data['gameState']
        rv.update({
            'red_zone': cls.parse_circle('redZone', game_state),
            'white_zone': cls.parse_circle('poisonGasWarning', game_state),
            'blue_zone': cls.parse_circle('safetyZone', game_state),
        })
        return rv


class PlayerEventSerializer(EventSerializer):
    position = PositionSerializerField()
    player_id = serializers.CharField(source='player.player_id')
    player_name = serializers.CharField(source='player.player_name')

    class Meta:
        model = models.PlayerEvent
        fields = (
            'type', 'time', 'position', 'health',  # Read/write
            'telemetry', 'player',  # Read-only
            'player_id', 'player_name'  # Write-only
        )
        read_only_fields = ('player_id', 'player_name')
        extra_kwargs = {
            'telemetry': {'write_only': True},
            'player': {'write_only': True},
        }

    def to_representation(self, obj):
        print(obj)
        return super().to_representation(obj)

    def run_validation(self, data):
        rv = super().run_validation(data)
        char = data['character']

        player_id = char['accountId']
        player_match = self.context['players'].get(player_id=player_id)
        rv.update({
            'player': player_match,
            'position': char['location'],
            'health': char['health'],
        })
        return rv
