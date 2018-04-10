from rest_framework import serializers

from . import models


class MatchSerializer(serializers.ModelSerializer):
    mid = serializers.CharField(read_only=True)


class PlayerSerializer(serializers.ModelSerializer):
    pid = models.CharField(read_only=True)


class PlayerMatchSerializer(serializers.ModelSerializer):
    pass


class TelemetrySerializer(serializers.ModelSerializer):
    pass
