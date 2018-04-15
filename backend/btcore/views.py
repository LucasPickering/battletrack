from django.conf import settings
from rest_framework import generics, views
from rest_framework.response import Response

from . import devapi, models, serializers

api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


class MatchView(generics.RetrieveAPIView):
    queryset = models.Match.objects
    serializer_class = serializers.MatchSerializer
    lookup_field = 'id'


class PlayerView(views.APIView):
    queryset = models.Player.objects
    serializer_class = serializers.PlayerSerializer

    def get(self, request, **kwargs):
        # kwargs will have shard and either name or ID - this handles either case
        player = models.Player.objects.get(**kwargs)
        serializer = serializers.PlayerSerializer(player)
        return Response(serializer.data)


class TelemetryView(generics.RetrieveAPIView):
    queryset = models.Telemetry.objects
    serializer_class = serializers.TelemetrySerializer
    lookup_field = 'match'
    lookup_url_kwarg = 'id'
