from rest_framework import serializers

from . import models


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Match
        fields = ('id', 'shard', 'players')


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Player
        fields = ('id', 'matches')


class PlayerMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PlayerMatch
        fields = ('player', 'match', 'placement')


class TelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Telemetry
        fields = ('match')
