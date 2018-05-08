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

        # If requested, populate missing players or telemetry data for the match
        if request.GET.get('popPlayers', False) is not False:
            for roster_match in match.rosters.all().select_related('players')[0]:  # Rate limiting!
                for player_match in roster_match.players.all()[:5]:
                    # If there is no Player for this PlayerMatch, then the Player isn't in the DB.
                    # Run a get for it by ID to get it pulled from the API.
                    if not player_match.player_ref:
                        Player.objects.get(id=player_match.player_id)
        if request.GET.get('popTelemetry', False) is not False:
            Telemetry.objects.get(match=match.id)  # Will pull from the API if necessary

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
            for player_match in player.matches.all()[:5]:  # Rate limiting!
                # If there is no RosterMatch for this PlayerMatch, then the Match isn't in the DB.
                # Run a get for it by ID get it pulled from the API.
                if not player_match.roster:
                    Match.objects.get(id=player_match.match_id)

        serializer = self.serializer_class(player)
        return Response(serializer.data)
