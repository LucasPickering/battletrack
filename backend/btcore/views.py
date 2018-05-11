from rest_framework import views
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import serializers, util
from .models import Match, Player
from telemetry.models import Telemetry


class MatchView(views.APIView):
    queryset = Match.objects.prefetch_related('rosters__players__stats')
    serializer_class = serializers.MatchSerializer

    def get(self, request, id):
        match = self.queryset.get(id=id)

        # If requested, populate missing telemetry data for the match
        if request.GET.get('popTelemetry', False) is not False:
            Telemetry.objects.preload(match=match.id)  # Will pull from the API if necessary

        serializer = self.serializer_class(match)
        return Response(serializer.data)


class PlayerView(views.APIView):
    queryset = Player.objects.prefetch_related('matches__stats', 'matches__roster__match',
                                               'matches__roster__players')
    serializer_class = serializers.PlayerSerializer

    def get(self, request, shard, **kwargs):
        # kwargs will have either name or ID - this handles either case
        # Only fetch PlayerMatches from the specified shard
        player = self.queryset.filter(matches__shard=shard).distinct().get(shard=shard, **kwargs)

        # If requested, populate all missing match matches for the player
        if request.GET.get('popMatches', False) is not False:
            match_ids = [pm.match_id for pm in player.matches.all()]
            Match.objects.multi_preload('id', match_ids)

            # Refresh the object, but don't hit the API this time
            player = self.queryset.get(shard=shard, hit_api=False, **kwargs)

        serializer = self.serializer_class(player)
        return Response(serializer.data)


@api_view(['GET'])
def consts(request):
    return Response({
        'shards': util.SHARDS,
        'game_modes': util.GAME_MODES,
        'perspectives': util.PERSPECTIVES,
        'maps': util.MAPS,
    })
