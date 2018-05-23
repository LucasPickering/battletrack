from collections import defaultdict

from django.db import transaction
from rest_framework import serializers

from . import models, util


class OrderedManySerializer(serializers.ModelSerializer):
    """
    @brief      An extended version of ModelSerializer that supports the 'order_by' field when used
                as a many-serializer. The 'order_by' field functions similarly to the 'source'
                field. During serialization, the list of items will be serialized list usual, then
                sorted by specified field. If the items themselves are sortable, then you can use
                "order_by='*'", otherwise use "order_by='field1.field2'" to sort by field1.field2.
                If a nested relationship is used by the nested value is missing on an item, it is
                sorted with the value None. If the field name starts with '-', the ordering will be
                reversed.
    """

    class OrderedListSerializer(serializers.ListSerializer):
        ORDER_BY_SELF_CHAR = '*'
        ORDER_BY_SEP_CHAR = '.'
        ORDER_BY_REVERSE_CHAR = '-'

        def __init__(self, *args, **kwargs):
            order_by = kwargs.pop('order_by')

            # Check if the field starts with the special character that indicates reversal
            if order_by.startswith(self.ORDER_BY_REVERSE_CHAR):
                self._order_by_reverse = True
                order_by = order_by[len(self.ORDER_BY_REVERSE_CHAR):]
            else:
                self._order_by_reverse = False

            self._order_by_fields = order_by.split(self.ORDER_BY_SEP_CHAR)
            super().__init__(*args, **kwargs)

        def key_func(self, item):
            """
            @brief      Key function for sorting the given item
                        '*': sort by the item itself
                        'field1': sort by item.field1
                        'field1.field2': sort by item.field1.field2
                        'field1.*' will also return item.field1 (but don't do this)
                        If a field is missing at any level in the nesting, the value is sorted last
                        (EVEN IF the sorting is reversed reverse).

            @param      self  The object
            @param      item  The item

            @return     A tuple of (bool, sortable value) where the bool is false iff there was a
                        KeyError while traversing the nested objects. In this case, the sortable
                        value will be None, which isn't actually sortable, so the bool is used to
                        make None sort last.
            """
            for attr in self._order_by_fields:
                if item is None or attr == self.ORDER_BY_SELF_CHAR:
                    break
                item = item.get(attr)

            """
            We want the bool to always sort populated values before None (even with reversal)
            item is None | reverse | Output
            -------------------------------
            False        | False   | False
            False        | True    | True
            True         | False   | True
            True         | True    | False

            The mighty truth table says to use XOR. thank u mr manolios
            """
            return ((item is None) ^ self._order_by_reverse, item)

        def to_representation(self, instance):
            data_list = super().to_representation(instance)
            data_list.sort(key=self.key_func, reverse=self._order_by_reverse)
            return data_list

    @classmethod
    def many_init(cls, *args, **kwargs):
        kwargs['child'] = cls()
        return cls.OrderedListSerializer(*args, **kwargs)


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


class MatchRosterSerializer(OrderedManySerializer):
    """
    @brief      Contains info about a Roster for a certain Match
    """
    players = MatchPlayerSerializer(many=True)

    class Meta:
        model = models.RosterMatch
        fields = ('id', 'win_place', 'players')


class RosterMatchSerializer(serializers.ModelSerializer):
    """
    @brief      Serialization for a certain Player's roster in a match
    """
    players = PlayerSummarySerializer(many=True)

    class Meta:
        model = models.RosterMatch
        fields = ('id', 'players')


class PlayerMatchSerializer(OrderedManySerializer):
    """
    @brief      Contains info about a Match for a certain Player
    """
    match = MatchSummarySerializer(source='roster.match', default=None, read_only=True)
    roster = PlayerSummarySerializer(source='roster.players', default=None, read_only=True,
                                     many=True)
    stats = PlayerMatchStatsSerializer(read_only=True)

    class Meta:
        model = models.PlayerMatch
        fields = ('match', 'roster', 'match_id', 'shard', 'stats')


class MatchSerializer(DevDeserializer):
    rosters = MatchRosterSerializer(many=True, order_by='win_place')

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

        # 'squad' = TPP Squad, 'squad-fpp' = FPP Squad
        mode_temp = attrs['gameMode']
        if '-' in mode_temp:
            mode, perspective = mode_temp.split('-')
        else:
            mode, perspective = mode_temp, 'tpp'

        shard = attrs['shardId']
        map_name = util.MAPS[attrs['mapName']]

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
                'id': roster['id'],
                'win_place': roster['attributes']['stats']['rank'],
                'players': [player_matches[pdata['id']] for pdata in participant_data],
            })

        return {
            'id': data['id'],
            'shard': shard,
            'mode': mode,
            'perspective': perspective,
            'map_name': map_name,
            'date': attrs['createdAt'],
            'duration': attrs['duration'],
            'telemetry_url': tel_asset['attributes']['URL'],
            'rosters': roster_matches,
        }

    @transaction.atomic
    def create(self, validated_data):
        rosters = validated_data.pop('rosters')

        # Make two dicts: RosterID:List(PlayerMatch-dict), and PlayerID:PlayerMatchStats-dict
        roster_to_players = {roster['id']: roster.pop('players') for roster in rosters}
        player_to_stats = {player['player_id']: player.pop('stats')
                           for players in roster_to_players.values() for player in players}

        # Create the Match
        match = models.Match.objects.create(**validated_data)

        # Create each RosterMatch
        roster_matches = models.RosterMatch.objects.bulk_create(
            models.RosterMatch(match=match, **roster) for roster in rosters,
        )
        match.cache_related('rosters', *roster_matches)  # Cache each RosterMatch on the Match

        # Using our dict of RosterID:List(PlayerMatch-dict), build a dict of PlayerID:RosterMatch
        player_to_roster = {player['player_id']: rm
                            for rm in roster_matches for player in roster_to_players[rm.id]}

        # Figure out which PlayerMatches are already in the DB and need their roster/stats linked
        existing_pms = list(models.PlayerMatch.objects.filter(match_id=match.id, roster=None))

        # Set the roster on each pre-existing PlayerMatch
        for player in existing_pms:
            player.roster = player_to_roster[player.player_id]
            player.save()

        # Create all the missing PlayerMatches
        existing_set = set(pm.player_id for pm in existing_pms)  # Existing player IDs
        created_pms = models.PlayerMatch.objects.bulk_create(
            models.PlayerMatch(roster=player_to_roster[player['player_id']], match_id=match.id,
                               **player)
            for players in roster_to_players.values() for player in players  # Nested list
            if player['player_id'] not in existing_set
        )
        all_pms = existing_pms + created_pms

        # Cache each PlayerMatch on its associated RosterMatch object
        for pm in all_pms:
            player_to_roster[pm.player_id].cache_related('players', pm)

        # Create all Stats objects. We have to re-query for all the PlayerMatch objects in order
        # to get copies with the primary keys
        models.PlayerMatchStats.objects.bulk_create(
            models.PlayerMatchStats(player_match=pm, **player_to_stats[pm.player_id])
            for pm in all_pms
        )

        return match


class PlayerSerializer(DevDeserializer):
    matches = PlayerMatchSerializer(many=True, order_by='-match.date')  # Latest matches first

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
            'match_id': m['id'],
            'shard': shard,
        } for m in dev_data['relationships']['matches']['data']]

        return {
            'id': player_id,
            'name': player_name,
            'matches': matches,
        }

    def _update_or_create_matches(self, player, matches):
        pid, name = player.id, player.name

        # Find the PlayerMatches that are already in the DB
        existing = models.PlayerMatch.objects.filter(player_id=pid)

        # Link the Player object to PlayerMatches that don't have it yet
        existing.filter(player_ref=None).update(player_ref=player)

        # Create all the PlayerMatches that are missing
        existing_match_ids = set(pm.match_id for pm in existing)
        models.PlayerMatch.objects.bulk_create(
            models.PlayerMatch(player_id=pid, player_name=name, player_ref=player, **match)
            for match in matches if match['match_id'] not in existing_match_ids
        )

    @transaction.atomic
    def update(self, player, validated_data):
        self._update_or_create_matches(player, validated_data.pop('matches'))
        return player

    @transaction.atomic
    def create(self, validated_data):
        matches = validated_data.pop('matches')

        # Create the Player, then update PlayerMatches
        player = models.Player.objects.create(**validated_data)
        self._update_or_create_matches(player, matches)

        return player
