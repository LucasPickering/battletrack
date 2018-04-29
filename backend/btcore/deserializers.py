from collections import defaultdict

from django.db import transaction
from rest_framework import serializers

from . import models
from .serializers import PositionSerializer, CircleSerializer

print('asdfasdfasdf')

class PlayerMatchStatsDevDeserializer(serializers.ModelSerializer):
    """
    @brief      Deserialize player stats data from the dev API into our model format.
                Maps dev API field names to our model field names. Names that match between the two
                (e.g. 'boosts') don't need to be explicitly mapped.
    """
    DBNOs = serializers.IntegerField(source='dbnos')
    damageDealt = serializers.FloatField(source='damage_dealt')
    deathType = serializers.CharField(source='death_type')
    headshotKills = serializers.IntegerField(source='headshot_kills')
    killPlace = serializers.IntegerField(source='kill_place')
    killPoints = serializers.IntegerField(source='kill_points')
    killStreaks = serializers.IntegerField(source='kill_streaks')
    longestKill = serializers.IntegerField(source='longest_kill')
    mostDamage = serializers.IntegerField(source='most_damage')
    rideDistance = serializers.FloatField(source='ride_distance')
    roadKills = serializers.IntegerField(source='road_kills')
    teamKills = serializers.IntegerField(source='team_kills')
    timeSurvived = serializers.IntegerField(source='time_survived')
    vehicleDestroys = serializers.IntegerField(source='vehicle_destroys')
    walkDistance = serializers.FloatField(source='walk_distance')
    weaponsAcquired = serializers.IntegerField(source='weapons_acquired')
    winPlace = serializers.IntegerField(source='win_place')
    winPoints = serializers.IntegerField(source='win_points')

    class Meta:
        model = models.PlayerMatchStats
        fields = ('player_match',
                  'DBNOs', 'assists', 'boosts', 'damageDealt', 'deathType', 'headshotKills',
                  'heals', 'killPlace', 'killPoints', 'killStreaks', 'kills', 'longestKill',
                  'mostDamage', 'revives', 'rideDistance', 'roadKills', 'teamKills', 'timeSurvived',
                  'vehicleDestroys', 'walkDistance', 'weaponsAcquired', 'winPlace', 'winPoints')


class DevDeserializerMeta(serializers.SerializerMetaclass):
    """
    @brief      Metaclass that registers the class as a dev deserializer for the corresponding
                model.
    """
    def __init__(cls, name, bases, attrs):
        try:
            meta = attrs['Meta']
            meta.model.dev_deserializer = cls
        except (KeyError, AttributeError):
            # No Meta or Meta.model defined
            pass
        return super().__init__(name, bases, attrs)


class MatchDevDeserializer(serializers.ModelSerializer, metaclass=DevDeserializerMeta):
    class Meta:
        model = models.Match
        fields = '__all__'

    def run_validation(self, data):
        d = data['data']

        match_id = d['id']
        attrs = d['attributes']
        mode, perspective = attrs['gameMode'].split('-')

        # Separate 'included' objects by type: we'll need to access all 3 types later
        incl = defaultdict(list)
        for e in data['included']:
            incl[e['type']].append(e)
        tel_asset = incl['asset'][0]  # Get the first asset, which is always telemetry metadata

        match = {
            'id': match_id,
            'shard': attrs['shardId'],
            'mode': mode,
            'perspective': perspective,
            'map_name': attrs.get('mapName', ''),  # This isn't always in the data for some reason
            'date': attrs['createdAt'],
            'duration': attrs['duration'],
            'telemetry_url': tel_asset['attributes']['URL'],
        }

        # Build a RosterMatch dict for each team in the game
        roster_matches = [{
            'id': roster['id'],
            'win_place': roster['attributes']['stats']['rank'],
            'participants': [d['id'] for d in roster['relationships']['participants']['data']],
        } for roster in incl['roster']]

        # Build a PLayerMatch dict for each player in the game
        player_matches = []
        for participant in incl['participant']:  # For each participant
            stats = participant['attributes']['stats']

            player_matches.append({
                'player_id': stats['playerId'],
                'match_id': match_id,
                'participant_id': participant['id'],
                'stats': stats,
            })

        return {
            'match': match,
            'roster_matches': roster_matches,
            'player_matches': player_matches,
        }

    @transaction.atomic
    def create(self, validated_data):
        match = models.Match.objects.create(**validated_data['match'])

        # Create RosterMatch objects
        participant_rosters = {}
        for roster_match in validated_data['roster_matches']:
            # Pop participants from the dict, pass the remaining values to the new model instance
            participants = roster_match.pop('participants')
            roster_match_obj = models.RosterMatch.objects.create(match=match, **roster_match)

            # Save this RosterMatch in a dict for each participant on the roster
            for participant_id in participants:
                participant_rosters[participant_id] = roster_match_obj

        # Build a PLayerMatch for each player in the game
        for player_match in validated_data['player_matches']:  # For each PlayerMatch dict...
            participant_id = player_match['participant_id']
            stats = player_match['stats']

            # Look up RosterMatch by participant ID
            new_vals = {'roster_match': participant_rosters[participant_id]}
            player_match_obj, created = models.PlayerMatch.objects.update_or_create(
                player_id=player_match['player_id'],
                match_id=player_match['match_id'],
                defaults=new_vals,  # New values to insert
            )

            # Deserialize the stats and save them
            stats['player_match'] = player_match_obj.id
            stats_serializer = PlayerMatchStatsDevDeserializer(data=stats)
            stats_serializer.is_valid(raise_exception=True)
            stats_serializer.save()

        return match


class PlayerDevDeserializer(serializers.ModelSerializer, metaclass=DevDeserializerMeta):
    class Meta:
        model = models.Player
        fields = '__all__'

    def run_validation(self, data):
        # Build the Player object
        attrs = data['attributes']
        player = {
            'id': data['id'],
            'name': attrs['name'],
            'shard': attrs['shardId'],
        }

        # Collect the ID of every match this player has participated in
        match_ids = [m['id'] for m in data['relationships']['matches']['data']]

        return {'player': player, 'match_ids': match_ids}

    @transaction.atomic
    def create(self, validated_data):
        player = models.Player.objects.create(**validated_data['player'])

        # Create a PlayerMatch object for each match
        for match_id in validated_data['match_ids']:
            # If the PlayerMatch already exists, update it with the player reference
            # Otherwise, create a new one
            new_vals = {
                'player_ref': player,
            }
            models.PlayerMatch.objects.update_or_create(
                player_id=player.id,
                match_id=match_id,
                defaults=new_vals,  # New values to insert
            )

        return player


# Dict that stores event name (e.g. 'LogPlayerKill') and corresponding deserializer. Populated by
# the decorator below, to be used on each deserializer class.
EVENT_DESERIALIZERS = {}


def event_deserializer(name):
    """
    @brief      Decorator to register a class as a deserializer for a particular event type. Takes
                an event type string, e.g. 'LogPlayerKill'.

    @param      name  the event type
    """
    def inner(cls):
        if name in EVENT_DESERIALIZERS:
            raise ValueError(f"Cannot register {cls} under {name} because it is already in use")
        EVENT_DESERIALIZERS[name] = cls
        return cls
    return inner


class TelemetryDevDeserializer(serializers.ModelSerializer, metaclass=DevDeserializerMeta):
    class Meta:
        model = models.Telemetry
        fields = '__all__'

    def parse_match_create(self, match_id, event):
        return [{'id': char['accountId'], 'name': char['name']} for char in event['characters']]

    def run_validation(self, data):
        match = data['match']
        players = None
        events = []

        # Parse each event
        for event in data['telemetry']:
            typ = event['_T']

            # Special case for this event type, because it contains all players' names
            if typ == 'LogMatchStart':
                players = self.parse_match_create(match.id, event)

            try:
                # Get the deserializer class for this event type
                deserializer_class = EVENT_DESERIALIZERS[typ]
            except KeyError:
                # We don't care about this event type, onto the next one
                continue

            # Deserialize the event
            event['match_id'] = match.id
            serializer = deserializer_class(data=event)
            serializer.is_valid(raise_exception=True)
            events.append(serializer)  # Store the serializer for later

        return {
            'match': match,
            'players': players,
            'events': events,
        }

    @transaction.atomic
    def create(self, validated_data):
        match = validated_data['match']

        # Update each PlayerMatch with the player's name
        for player in validated_data['players']:
            # There should already be a corresponding PlayerMatch
            models.PlayerMatch.objects.filter(
                player_id=player['id'],
                match_id=match.id,
            ).update(player_name=player['name'])

        # Save each serialized event
        for event_serializer in validated_data['events']:
            event_serializer.save()

        return models.Telemetry.objects.create(match=validated_data['match'])


class EventDevDeserializer(serializers.ModelSerializer):
    class Meta:
        model = models.Event
        fields = '__all__'

    def run_validation(self, data):
        return {'telemetry': data['match_id'], 'time': data['_D']}


# @event_deserializer('LogGameStatePeriodic')
class GameStatePeriodicEventDevDeserializer(EventDevDeserializer):
    class Meta:
        model = models.GameStatePeriodicEvent
        fields = '__all__'

    @staticmethod
    def parse_circle(prefix, game_state):
        return {
            'position': game_state[prefix + 'Position'],
            'radius': game_state[prefix + 'Radius'],
        }

    def run_validation(self, data):
        rv = super().run_validation(data)
        rv.update({
            'red_zone': self.parse_circle('redZone'),
            'white_zone': self.parse_circle('poisonGasWarning'),
            'blue_zone': self.parse_circle('safetyZone'),
        })
        print(rv)
        return rv
