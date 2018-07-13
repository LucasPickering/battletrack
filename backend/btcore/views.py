from rest_framework import status
from rest_framework import views
from rest_framework.exceptions import APIException
from rest_framework.response import Response

from . import serializers
from .models import Match, Player
from telemetry.models import Telemetry


class BadRequestException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST


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
    POP_MATCHES_PARAM = 'popMatches'
    POP_MATCHES_ALL = 'all'

    queryset = Player.objects.prefetch_related('matches__stats', 'matches__roster__match',
                                               'matches__roster__players')
    serializer_class = serializers.PlayerSerializer

    def get(self, request, shard, **kwargs):
        # kwargs will have either name or ID - this handles either case
        player = self.queryset.get(shard=shard, **kwargs)

        # If requested, populate missing match matches for the player
        pop_matches = request.GET.get(self.POP_MATCHES_PARAM, self.POP_MATCHES_ALL)
        if pop_matches:
            match_ids = player.matches.filter(shard=shard).values_list('match_id', flat=True)

            if pop_matches != self.POP_MATCHES_ALL:
                try:
                    num_to_pop = int(pop_matches)
                    if num_to_pop >= 0:
                        match_ids = match_ids[num_to_pop]
                    else:
                        raise BadRequestException(f"{self.POP_MATCHES_PARAM} must be non-negative")
                except ValueError:
                    raise BadRequestException(f"{self.POP_MATCHES_PARAM} must be a non-negative"
                                              f" number or '{self.POP_MATCHES_ALL}'")

            Match.objects.multi_preload('id', match_ids)

            # Refresh the object. By excluding the shard, we tell it not to hit the API this time.
            player = self.queryset.get(**kwargs)

        serializer = self.serializer_class(player, context={'shard': shard})
        return Response(serializer.data)
