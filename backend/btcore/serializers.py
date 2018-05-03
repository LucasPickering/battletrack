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


class DevDeserializer(serializers.ModelSerializer, metaclass=DevDeserializerMeta):
    @staticmethod
    def convert_dev_data(dev_data, *args, **kwargs):
        pass

    @classmethod
    def from_dev_data(cls, dev_data, *args, **kwargs):
        return cls(*args, data=cls.convert_dev_data(dev_data), **kwargs)


class MatchSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = ('mode', 'perspective', 'map_name', 'date', 'duration')


class PlayerMatchStatsSerializer(DevDeserializer):
    # Left value is the name in the API data, right value is the name in the model
    FIELD_MAPPINGS = [
        ('assists', 'assists'),
        ('boosts', 'boosts'),
        ('DBNOs', 'dbnos'),
        ('damageDealt', 'damage_dealt'),
        ('deathType', 'death_type'),
        ('headshotKills', 'headshot_kills'),
        ('heals', 'heals'),
        ('killPlace', 'kill_place'),
        ('killPoints', 'kill_points'),
        ('killStreaks', 'kill_streaks'),
        ('kills', 'kills'),
        ('longestKill', 'longest_kill'),
        ('mostDamage', 'most_damage'),
        ('revives', 'revives'),
        ('rideDistance', 'ride_distance'),
        ('roadKills', 'road_kills'),
        ('teamKills', 'team_kills'),
        ('timeSurvived', 'time_survived'),
        ('vehicleDestroys', 'vehicle_destroys'),
        ('walkDistance', 'walk_distance'),
        ('weaponsAcquired', 'weapons_acquired'),
        ('winPlace', 'win_place'),
        ('winPoints', 'win_points'),
    ]

    class Meta:
        model = models.PlayerMatchStats
        exclude = ('player_match',)

    @staticmethod
    def convert_dev_data(dev_data):
        # Map each field from the API name to the model name. Fields excluded from the mapping are
        # not included in the output.
        return {model_name: dev_data[api_name] for api_name, model_name
                in PlayerMatchStatsSerializer.FIELD_MAPPINGS}


class MatchPlayerSerializer(serializers.ModelSerializer):
    """
    @brief      Serialization/deserialization for a Player in a certain Match
    """
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('player_id', 'player_name', 'stats')
        read_only_fields = ('player_name',)
        extra_kwargs = {
            'roster': {'write_only': True},
        }


class MatchRosterSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Roster for a certain Match
    """
    players = MatchPlayerSerializer(many=True)

    class Meta:
        model = models.RosterMatch
        fields = ('win_place', 'players')


class PlayerMatchSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Match for a certain Player
    """
    match = MatchSummarySerializer(source='roster.match', default=None, read_only=True)
    stats = PlayerMatchStatsSerializer(read_only=True)

    class Meta:
        model = models.PlayerMatch
        fields = ('player_name', 'match_id', 'stats', 'match')
        extra_kwargs = {
            'player_name': {'write_only': True},
        }


class MatchSerializer(DevDeserializer):
    rosters = MatchRosterSerializer(many=True)

    class Meta:
        model = models.Match
        fields = ('id', 'shard', 'mode', 'perspective', 'map_name', 'date', 'duration',
                  'telemetry_url', 'rosters')
        extra_kwargs = {
            'telemetry_url': {'write_only': True},
        }

    @staticmethod
    def convert_dev_data(dev_data):
        data = dev_data['data']

        attrs = data['attributes']
        mode, perspective = attrs['gameMode'].split('-')

        # Separate 'included' objects by type: we'll need to access all 3 types later
        incl = defaultdict(list)
        for e in dev_data['included']:
            incl[e['type']].append(e)
        tel_asset = incl['asset'][0]  # Get the first asset, which is always telemetry metadata

        # Dict of each PlayerMatch data, keyed on participant ID
        player_matches = {}
        for participant in incl['participant']:
            stats_dev_data = participant['attributes']['stats']
            player_id = stats_dev_data.pop('playerId')  # We need this, but not in the stats
            stats = PlayerMatchStatsSerializer.convert_dev_data(stats_dev_data)

            player_matches[participant['id']] = {
                'player_id': player_id,
                'stats': stats,
            }

        # Build a RosterMatch dict for each team in the game, and nest a list of PlayerMatches
        # in each one
        roster_matches = []
        for roster in incl['roster']:
            participant_data = roster['relationships']['participants']['data']
            roster_matches.append({
                # 'id': roster['id'],
                'win_place': roster['attributes']['stats']['rank'],
                'players': [player_matches[pdata['id']] for pdata in participant_data],
            })

        return {
            'id': data['id'],
            'shard': attrs['shardId'],
            'mode': mode,
            'perspective': perspective,
            'map_name': attrs.get('mapName', ''),  # This isn't always in the data for some reason
            'date': attrs['createdAt'],
            'duration': attrs['duration'],
            'telemetry_url': tel_asset['attributes']['URL'],
            'rosters': roster_matches,
        }

    @transaction.atomic
    def create(self, validated_data):
        rosters = validated_data.pop('rosters')

        # Build a list where each element is a list of players for a roster, and build a dict of
        # player ID to stats object
        player_lists = [roster.pop('players') for roster in rosters]  # List of lists
        player_to_stats = {}
        for players in player_lists:
            for player in players:
                player_to_stats[player['player_id']] = player.pop('stats')

        # Create the Match
        match = models.Match.objects.create(**validated_data)
        match_id = match.id

        # Create each RosterMatch
        models.RosterMatch.objects.bulk_create(
            models.RosterMatch(match=match, **roster) for roster in rosters
        )
        # Re-fect RosterMatches to get copies with the IDs
        roster_matches = models.RosterMatch.objects.filter(match=match)

        # Build a dict of player ID to RosterMatch. This relies on the fact that the ordering of
        # player_lists corresponds to that of roster_matches (which will always be the case).
        player_to_roster = {}
        for players, roster_match in zip(player_lists, roster_matches):
            for player in players:
                player_to_roster[player['player_id']] = roster_match

        # Figure out which PlayerMatches are already in the DB so they can be updated
        existing_pms = models.PlayerMatch.objects.filter(match_id=match_id).exclude(player_id=None)

        # Set the roster on each pre-existing PlayerMatch
        for player in existing_pms:
            player.roster = player_to_roster[player.player_id]
            player.save()

        # Create all the missing PlayerMatches
        existing_set = set(existing_pms.values_list('player_id', flat=True))  # Existing player IDs
        models.PlayerMatch.objects.bulk_create(
            models.PlayerMatch(roster=player_to_roster[player['player_id']], match_id=match_id,
                               **player)
            for players in player_lists for player in players  # Loop through nested list
            if player['player_id'] not in existing_set
        )

        # Create all Stats objects. We have to re-query for all the PlayerMatch objects in order
        # to get full copies
        models.PlayerMatchStats.objects.bulk_create(
            models.PlayerMatchStats(player_match=pm, **player_to_stats[pm.player_id])
            for pm in models.PlayerMatch.objects.filter(match_id=match_id)
        )

        return player


class PlayerSerializer(DevDeserializer):
    matches = PlayerMatchSerializer(many=True)

    class Meta:
        model = models.Player
        fields = '__all__'

    @staticmethod
    def convert_dev_data(dev_data):
        attrs = dev_data['attributes']

        # Build a list of PlayerMatch dicts
        player_id = dev_data['id']
        player_name = attrs['name']
        matches = [{
            'player_name': player_name,
            'match_id': m['id'],
        } for m in dev_data['relationships']['matches']['data']]

        return {
            'id': player_id,
            'name': player_name,
            'shard': attrs['shardId'],
            'matches': matches,
        }

    @transaction.atomic
    def create(self, validated_data):
        matches = validated_data.pop('matches')

        player = models.Player.objects.create(**validated_data)
        player_id = player.id

        # Figure out which PlayerMatches are already in the DB and update them
        existing = models.PlayerMatch.objects.filter(player_id=player_id).exclude(match_id=None)
        existing.update(player_name=player.name, player_ref=player)

        # Create all the PlayerMatches that are missing
        existing_set = set(existing.values_list('match_id', flat=True))  # Existing match IDs
        models.PlayerMatch.objects.bulk_create(
            models.PlayerMatch(player_id=player_id, player_ref=player, **match)
            for match in matches if match['match_id'] not in existing_set
        )

        return player


class TelemetrySerializer(DevDeserializer):
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
