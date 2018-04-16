from collections import defaultdict

from django.conf import settings
from django.db import transaction
from rest_framework import serializers

from . import devapi, models


api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


class MatchSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = ('mode', 'map_name', 'date', 'duration')


class PlayerMatchStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlayerMatchStats
        exclude = ('player_match',)


class PlayerMatchSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Match for a certain Player
    """
    match = MatchSummarySerializer(source='roster_match.match', default=None)
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('match_id', 'stats', 'match')


class MatchPlayerSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Player for a certain Match
    """
    name = serializers.CharField(source='player_ref.name', default=None)
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('player_id', 'name', 'stats')


class MatchRosterSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Roster for a certain Match
    """
    players = MatchPlayerSerializer(many=True)

    class Meta:
        model = models.RosterMatch
        exclude = ('id', 'match')


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
    class Meta:
        model = models.Telemetry
        fields = '__all__'


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


class MatchDevDeserializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = '__all__'

    def run_validation(self, data):
        return data  # Fake validation! SAD!

    @transaction.atomic
    def create(self, validated_data):
        data = validated_data['data']
        attrs = data['attributes']

        # Separate 'included' objects by type: we'll need to access all 3 types later
        incl = defaultdict(list)
        for e in validated_data['included']:
            incl[e['type']].append(e)

        tel_asset = incl['asset'][0]  # Get the first asset, which is always telemetry metadata

        # Create the main match object
        match_id = data['id']
        match = models.Match.objects.create(
            id=match_id,
            shard=attrs['shardId'],
            mode=attrs['gameMode'],
            # API doesn't always include this field, so default to None
            map_name=attrs.get('mapName', ''),
            date=attrs['createdAt'],
            duration=attrs['duration'],
            telemetry_url=tel_asset['attributes']['URL'],
        )

        # Build a RosterMatch for each team in the game
        participant_rosters = {}  # dict of participant_id:RosterMatch, used to create PlayerMatches
        for roster in incl['roster']:  # For each roster...
            attrs = roster['attributes']
            # Create a RosterMatch object
            roster_match = models.RosterMatch.objects.create(
                id=roster['id'],
                match=match,
                placement=attrs['stats']['rank'],
            )

            # Save this RosterMatch in a dict for each participant on the roster
            for participant in roster['relationships']['participants']['data']:
                participant_rosters[participant['id']] = roster_match

        # Build a PLayerMatch for each player in the game
        for participant in incl['participant']:  # For each participant
            stats = participant['attributes']['stats']
            new_vals = {
                'roster_match': participant_rosters[participant['id']],  # Look up by participant ID
            }
            player_match, created = models.PlayerMatch.objects.update_or_create(
                player_id=stats['playerId'],
                match_id=match_id,
                defaults=new_vals,  # New values to insert
            )

            # Deserialize the stats and save them
            stats['player_match'] = player_match.id
            stats_serializer = PlayerMatchStatsDevDeserializer(data=stats)
            stats_serializer.is_valid(raise_exception=True)
            stats_serializer.save()

        return match


class PlayerDevDeserializer(serializers.ModelSerializer):
    class Meta:
        model = models.Player
        fields = '__all__'

    def run_validation(self, data):
        return data  # The data is in a very strange structure, so don't apply validation

    @transaction.atomic
    def create(self, validated_data):
        attrs = validated_data['attributes']

        # Build the Player object
        player_id = validated_data['id']
        player = models.Player.objects.create(
            id=player_id,
            name=attrs['name'],
            shard=attrs['shardId'],
        )

        # Create a PlayerMatch object for each match
        match_ids = (m['id'] for m in validated_data['relationships']['matches']['data'])
        for match_id in match_ids:
            # If the PlayerMatch already exists, update it with the player reference
            # Otherwise, create a new one
            new_vals = {
                'player_ref': player,
            }
            models.PlayerMatch.objects.update_or_create(
                player_id=player_id,
                match_id=match_id,
                defaults=new_vals,  # New values to insert
            )

        return player


class TelemetryDevDeserializer(serializers.ModelSerializer):
    class Meta:
        model = models.Telemetry
        fields = '__all__'

    def run_validation(self, data):
        return data  # The data is in a very strange structure, so don't apply validation

    def create(self, validated_data):
        # TODO: Deserialization

        return models.Telemetry.objects.create(match=validated_data['match'])


# Add these dev deserializers to their respective model classes, so the query set can access them
models.Match.dev_deserializer = MatchDevDeserializer
models.Player.dev_deserializer = PlayerDevDeserializer
models.Telemetry.dev_deserializer = TelemetryDevDeserializer
