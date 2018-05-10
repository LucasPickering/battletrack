from collections import defaultdict

from django.db import transaction
from rest_framework import serializers

from . import models


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
    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        pass

    @classmethod
    def from_dev_data(cls, dev_data, many=False, *args, **kwargs):
        # Special case to nicely handle converting data for a "many" serializer
        if many:
            data = [cls.convert_dev_data(e) for e in dev_data]
        else:
            data = cls.convert_dev_data(dev_data)
        return cls(*args, data=data, many=many, **kwargs)


class MatchSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = ('mode', 'perspective', 'map_name', 'date', 'duration')


class PlayerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlayerMatch
        fields = ('player_id', 'player_name')


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

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
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
        fields = ('roster', 'player_id', 'player_name', 'shard', 'stats')
        extra_kwargs = {
            'roster': {'write_only': True},
            'shard': {'write_only': True},
        }


class MatchRosterSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Roster for a certain Match
    """
    players = MatchPlayerSerializer(many=True)

    class Meta:
        model = models.RosterMatch
        fields = ('win_place', 'players')


class RosterMatchSerializer(serializers.ModelSerializer):
    """
    @brief      Serialization for a certain Player's roster in a match
    """
    players = PlayerSummarySerializer(many=True)

    class Meta:
        model = models.RosterMatch
        fields = ('players',)


class PlayerMatchSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Match for a certain Player
    """
    match = MatchSummarySerializer(source='roster.match', default=None, read_only=True)
    roster = PlayerSummarySerializer(source='roster.players', default=None, read_only=True,
                                     many=True)
    stats = PlayerMatchStatsSerializer(read_only=True)

    class Meta:
        model = models.PlayerMatch
        fields = ('match', 'roster', 'match_id', 'player_name', 'shard', 'stats')
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

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        data = dev_data['data']

        attrs = data['attributes']
        mode, perspective = attrs['gameMode'].split('-')
        shard = attrs['shardId']

        # Separate 'included' objects by type: we'll need to access all 3 types later
        incl = defaultdict(list)
        for e in dev_data['included']:
            incl[e['type']].append(e)
        tel_asset = incl['asset'][0]  # Get the first asset, which is always telemetry metadata

        # Dict of each PlayerMatch data, keyed on participant ID
        player_matches = {}
        for participant in incl['participant']:
            stats_dev_data = participant['attributes']['stats']

            # We need this, but not in the stats
            player_id = stats_dev_data.pop('playerId')
            player_name = stats_dev_data.pop('name')

            stats = PlayerMatchStatsSerializer.convert_dev_data(stats_dev_data)

            player_matches[participant['id']] = {
                'player_id': player_id,
                'player_name': player_name,
                'shard': shard,
                'stats': stats,
            }

        # Build a RosterMatch dict for each team in the game, and nest a list of PlayerMatches
        # in each one
        roster_matches = []
        for roster in incl['roster']:
            participant_data = roster['relationships']['participants']['data']
            roster_matches.append({
                'win_place': roster['attributes']['stats']['rank'],
                'players': [player_matches[pdata['id']] for pdata in participant_data],
            })

        return {
            'id': data['id'],
            'shard': shard,
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
        # Re-fetch RosterMatches to get copies with the IDs
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
        existing_set = set(pm.player_id for pm in existing_pms)  # Existing player IDs
        models.PlayerMatch.objects.bulk_create(
            models.PlayerMatch(roster=player_to_roster[player['player_id']], match_id=match_id,
                               **player)
            for players in player_lists for player in players  # Loop through nested list
            if player['player_id'] not in existing_set
        )

        # Create all Stats objects. We have to re-query for all the PlayerMatch objects in order
        # to get copies with the primary keys
        models.PlayerMatchStats.objects.bulk_create(
            models.PlayerMatchStats(player_match=pm, **player_to_stats[pm.player_id])
            for pm in models.PlayerMatch.objects.filter(match_id=match_id)
        )

        return match


class PlayerSerializer(DevDeserializer):
    matches = PlayerMatchSerializer(many=True)

    class Meta:
        model = models.Player
        fields = '__all__'

    @classmethod
    def convert_dev_data(cls, dev_data, **kwargs):
        attrs = dev_data['attributes']

        # Build a list of PlayerMatch dicts
        player_id = dev_data['id']
        player_name = attrs['name']
        shard = attrs['shardId']
        matches = [{
            'player_name': player_name,
            'match_id': m['id'],
            'shard': shard,
        } for m in dev_data['relationships']['matches']['data']]

        return {
            'id': player_id,
            'name': player_name,
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
