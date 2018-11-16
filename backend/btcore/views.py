from rest_framework import views
from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import serializers, util
from .models import Match, Player
from telemetry.models import Telemetry


class MatchView(views.APIView):
    queryset = Match.objects.prefetch_related(
        'rosters__players__stats',  # Player info, and stats for each player
    )
    serializer_class = serializers.MatchSerializer

    def get(self, request, id):
        match = self.queryset.get(id=id)

        # If requested, populate missing telemetry data for the match
        if request.GET.get('popTelemetry', False) is not False:
            # Will pull from the API if necessary
            Telemetry.objects.preload(match=match.id)

        serializer = self.serializer_class(match)
        return Response(serializer.data)


class RecentMatchesView(MatchView):
    DEFAULT_COUNT = 5
    serializer_class = serializers.MatchSummarySerializer

    def get(self, request):
        count = request.GET.get('count', self.DEFAULT_COUNT)
        matches = self.queryset.order_by('date')[:count]
        serializer = self.serializer_class(matches, many=True)
        return Response(serializer.data)


class PlayerView(views.APIView):
    POP_MATCHES_PARAM = 'popMatches'

    queryset = Player.objects.prefetch_related(
        'matches__stats',  # Stats for each match
        'matches__roster__players',  # Teammates for each match
        'matches__roster__match__rosters',  # Match metadata and roster count
    )
    serializer_class = serializers.PlayerSerializer

    def get(self, request, shard, **kwargs):
        # kwargs will have either name or ID - this handles either case
        player = self.queryset.get(shard=shard, **kwargs)

        # If requested, populate missing match matches for the player
        pop_matches = request.GET.get(self.POP_MATCHES_PARAM)
        if pop_matches is not None:
            match_ids = player.matches.filter(
                shard=shard).values_list('match_id', flat=True)
            Match.objects.multi_preload('id', match_ids)

            # Refresh the object. By excluding the shard, we tell it not to hit the API this time.
            player = self.queryset.get(**kwargs)

        serializer = self.serializer_class(player, context={'shard': shard})
        return Response(serializer.data)


@api_view(['GET'])
def shards(request):
    return Response(util.SHARDS)
