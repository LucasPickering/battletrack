from collections import defaultdict

from rest_framework import serializers

from . import models


class PlayerMatchStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlayerMatchStats


class PlayerMatchSerializer(serializers.ModelSerializer):
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        exclude = ('id', 'roster_match', 'player_ref')


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = '__all__'

    @staticmethod
    def deser_dev_api(data):
        d = data['data']
        attrs = d['attributes']

        # Separate 'included' objects by type: we'll need to access all 3 types later
        incl = defaultdict(list)
        for e in data['included']:
            incl[e['id']].append(e)

        tel_asset = incl['asset'][0]  # Get the first asset, which is always telemetry metadata

        # Create the main match object
        match_id = d['id']
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
        for participant in incl['participants']:  # For each participant
            attrs = participant['attributes']
            player_match = models.PlayerMatch.objects.create(
                player_id=attrs['playerId'],
                match_id=match_id,
                # Look up the RosterMatch object by participant ID
                roster_match=participant_rosters[participant['id']],
            )

            # Build a stats object
            stats = attrs['stats']
            models.PlayerMatchStats.objects.create(
                player_match=player_match,
                kills=stats['kills'],
            )

        return match
    models.Match.deser_dev_api = deser_dev_api  # Add this to the Match model


class TelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Telemetry
        fields = '__all__'


class PlayerSerializer(serializers.ModelSerializer):
    matches = PlayerMatchSerializer(many=True)

    class Meta:
        model = models.Player
        fields = '__all__'

    @staticmethod
    def deser_dev_api(data):
        attrs = data['attributes']

        # Build the Player object
        player_id = data['id']
        player = models.Player.objects.create(
            id=player_id,
            name=attrs['name'],
            shard=attrs['shardId'],
        )

        # Create a PlayerMatch object for each match
        match_ids = (m['id'] for m in data['relationships']['matches']['data'])
        for match_id in match_ids:
            models.PlayerMatch.objects.create(player_id=player_id,
                                              player_ref=player,
                                              match_id=match_id)

        return player
    models.Player.deser_dev_api = deser_dev_api  # Add this to the Player model
