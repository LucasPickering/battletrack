from django.conf import settings
from rest_framework import serializers

from . import devapi, models


api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


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
    match = MatchSummarySerializer(source='roster_match.match', default=None)
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('match_id', 'stats', 'match')


class MatchPlayerSerializer(serializers.ModelSerializer):
    """
    @brief      Contains info about a Player for a certain Match
    """
    stats = PlayerMatchStatsSerializer()

    class Meta:
        model = models.PlayerMatch
        fields = ('player_id', 'player_name', 'stats')


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
    class Meta:
        model = models.Telemetry
        fields = '__all__'
