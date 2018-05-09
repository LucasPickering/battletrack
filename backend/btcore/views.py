from rest_framework import views
from rest_framework.response import Response

from . import serializers
from .models import Match, Player
from telemetry.models import Telemetry


class MatchView(views.APIView):
    queryset = Match.objects.prefetch_related('rosters__players__stats')
    serializer_class = serializers.MatchSerializer

    def get(self, request, id):
        match = self.queryset.get(id=id)

        # If requested, populate missing telemetry data for the match
        if request.GET.get('popTelemetry', False) is not False:
            Telemetry.objects.preload('match', [match.id])  # Will pull from the API if necessary

        serializer = self.serializer_class(match)
        return Response(serializer.data)


class PlayerView(views.APIView):
    queryset = Player.objects.prefetch_related('matches__stats', 'matches__roster__match')
    serializer_class = serializers.PlayerSerializer

    def get(self, request, **kwargs):
        # kwargs will have shard and either name or ID - this handles either case
        player = self.queryset.get(**kwargs)

        # If requested, populate all missing match matches for the player
        if request.GET.get('popMatches', False) is not False:
            match_ids = [pm.match_id for pm in player.matches.all()][:5]
            Match.objects.preload('id', match_ids)
            player = self.queryset.get(**kwargs)  # Refresh the object

        serializer = self.serializer_class(player)
        return Response(serializer.data)
