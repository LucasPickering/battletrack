from django.conf import settings
from rest_framework import generics, views
from rest_framework.response import Response

from . import devapi, models, serializers

api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


class MatchView(views.APIView):
    queryset = models.Match.objects
    serializer_class = serializers.MatchSerializer

    def get(self, request, id):
        match = models.Match.objects.get(id=id)

        # If requested, populate missing players or telemetry data for the match
        if request.GET.get('popPlayers', False) is not False:
            for roster_match in match.rosters.all()[0]:  # Rate limiting!
                for player_match in roster_match.players.all()[:5]:
                    # If there is no Player for this PlayerMatch, then the Player isn't in the DB.
                    # Run a get for it by ID get it pulled from the API.
                    if not player_match.player_ref:
                        models.Player.objects.get(id=player_match.player_id)
        if request.GET.get('popTelemetry', False) is not False:
            models.Telemetry.objects.get(match=match.id)  # Will pull from the API if necessary

        serializer = serializers.MatchSerializer(match)
        return Response(serializer.data)


class PlayerView(views.APIView):
    queryset = models.Player.objects
    serializer_class = serializers.PlayerSerializer

    def get(self, request, **kwargs):
        # kwargs will have shard and either name or ID - this handles either case
        player = models.Player.objects.get(**kwargs)

        # If requested, populate all missing match matches for the player
        if request.GET.get('popMatches', False) is not False:
            for player_match in player.matches.all()[:5]:  # Rate limiting!
                # If there is no RosterMatch for this PlayerMatch, then the Match isn't in the DB.
                # Run a get for it by ID get it pulled from the API.
                if not player_match.roster_match:
                    models.Match.objects.get(id=player_match.match_id)

        serializer = serializers.PlayerSerializer(player)
        return Response(serializer.data)


class TelemetryView(generics.RetrieveAPIView):
    queryset = models.Telemetry.objects
    serializer_class = serializers.TelemetrySerializer
    lookup_field = 'match'
    lookup_url_kwarg = 'id'
