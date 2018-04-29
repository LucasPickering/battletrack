from collections import defaultdict

from django.conf import settings
from django.db import transaction
from rest_framework import serializers
from drf_writable_nested import WritableNestedModelSerializer

from . import devapi, models
from .fields import CircleSerializerField, PositionSerializerField


api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


# Dict that stores event name (e.g. 'LogPlayerKill') and corresponding deserializer. Populated by
# the decorator below, to be used on each deserializer class.
EVENT_SERIALIZERS = {}


def event_serializer(*names):
    """
    @brief      Decorator to register a class as a deserializer for a particular event type. Takes
                an event type string, e.g. 'LogPlayerKill'.

    @param      name  the event type
    """
    def inner(cls):
        for name in names:
            if name in EVENT_SERIALIZERS:
                raise ValueError(f"Cannot register {cls} under {name} because it is already in use")
            EVENT_SERIALIZERS[name] = cls
        return cls
    return inner


class DevDeserializerMeta(serializers.SerializerMetaclass):
    """
    @brief      Metaclass that registers the class as a dev deserializer for the corresponding
                model.
    """
    def __init__(cls, name, bases, attrs):
        try:
            attrs['Meta'].model.serializer = cls
        except (KeyError, AttributeError):
            # No Meta or Meta.model defined
            pass
        return super().__init__(name, bases, attrs)


class MatchSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = ('mode', 'perspective', 'map_name', 'date', 'duration')


class PlayerMatchStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlayerMatchStats
        exclude = ('player_match',)


class PlayerMatchSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Match for a certain Player
    """
    id = serializers.CharField(source='match_id')
    match = MatchSummarySerializer(source='roster_match.match', default=None)
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('id', 'stats', 'match')


class MatchPlayerSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Player for a certain Match
    """
    id = serializers.CharField(source='player_id')
    name = serializers.CharField(source='player_name')
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('id', 'name', 'stats')


class MatchRosterSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Roster for a certain Match
    """
    players = MatchPlayerSerializer(many=True)

    class Meta:
        model = models.RosterMatch
        exclude = ('match',)


class MatchSerializer(serializers.ModelSerializer):
    rosters = MatchRosterSerializer(many=True)

    class Meta:
        model = models.Match
        exclude = ('telemetry_url',)


class PlayerSerializer(serializers.ModelSerializer):
    matches = PlayerMatchSerializer(many=True)

    class Meta:
        model = models.Player
        fields = '__all__'


class TelemetrySerializer(serializers.ModelSerializer):
    events = serializers.SerializerMethodField()

    class Meta:
        model = models.Telemetry
        fields = ('match', 'events')

    def get_events(self, obj):
        events = []

        # Iterate over each event (and convert each one from Event to the proper subclass)
        for event in obj.events.all().select_subclasses():
            serializer = event.serializer(event)  # Serialize the data
            events.append(serializer.data)
        return events


class EventSerializer(WritableNestedModelSerializer, metaclass=DevDeserializerMeta):
    class Meta:
        model = models.Event
        exclude = ('id',)

    def run_validation(self, data):
        # Convert Dev API-formatted data into our format
        return {
            'telemetry': data['telemetry'],
            'type': data['_T'],
            'time': data['_D'],
        }

    def create(self, validated_data):
        self.initial_data = dict(validated_data)  # Hack to make writable nested fields work
        return super().create(validated_data)


@event_serializer('LogGameStatePeriodic')
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

    def run_validation(self, data):
        rv = super().run_validation(data)
        game_state = data['gameState']
        rv.update({
            'red_zone': self.parse_circle('redZone', game_state),
            'white_zone': self.parse_circle('poisonGasWarning', game_state),
            'blue_zone': self.parse_circle('safetyZone', game_state),
        })
        return rv


@event_serializer('LogPlayerPosition')
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

    def run_validation(self, data):
        rv = super().run_validation(data)
        char = data['character']

        player_id = char['accountId']
        match_id = rv['telemetry'].match.id
        player_match = models.PlayerMatch.objects.get(player_id=player_id, match_id=match_id)
        rv.update({
            'player': player_match,
            'position': char['location'],
            'health': char['health'],
        })
        return rv


# ~~~ BEWARE, HERE BE VERBOSE AND KINDA DISGUSTING DEV API DESERIALIZERS ~~~


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


class TelemetryDevDeserializer(serializers.ModelSerializer, metaclass=DevDeserializerMeta):
    class Meta:
        model = models.Telemetry
        fields = '__all__'

    @staticmethod
    def parse_player_create(event):
        char = event['character']
        return {
            'id': char['accountId'],
            'name': char['name'],
        }

    def run_validation(self, data):
        match = data['match']

        # Parse each event
        events = []
        players = []  # We'll build a list of all players in the game
        for event in data['telemetry']:
            typ = event['_T']

            # Special case for this event type, to initialize players
            if typ == 'LogPlayerCreate':
                players.append(self.parse_player_create(event))

            # If this is an event type we care about, save it for later
            if typ in EVENT_SERIALIZERS:
                events.append(event)

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
            # There is usually already an existing PlayerMatch, but if a player logged out during
            # the game then they wouldn't have been listed in the Match summary, so we'll create
            # them now.
            new_vals = {'player_name': player['name']}
            models.PlayerMatch.objects.update_or_create(
                player_id=player['id'],
                match_id=match.id,
                defaults=new_vals,
            )

        telemetry = models.Telemetry.objects.create(match=validated_data['match'])

        # Save each serialized event
        for event in validated_data['events']:
            event['telemetry'] = telemetry

            # Parse the event data with a serializer
            deserializer_class = EVENT_SERIALIZERS[event['_T']]
            serializer = deserializer_class(data=event)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return telemetry


class EventDeserializer(WritableNestedModelSerializer):
    telemetry = serializers.PrimaryKeyRelatedField(queryset=models.Telemetry.objects)

    class Meta:
        model = models.Event
        exclude = ('id',)

    def run_validation(self, data):
        return {'telemetry': data['telemetry'], 'time': data['_D']}
