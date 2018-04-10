from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

from . import bluehole, models, serializers

api = bluehole.BlueholeAPI.from_file(settings.BLUEHOLE_API_KEY_FILE)


class Match(APIView):
    def parse_from_raw(self, raw_data):
        data = raw_data['data']
        return models.Match.objects.create(id=data['id'],
                                           shard=data['attributes']['shardId'])

    def get(self, request, match_id):
        try:
            match = models.Match.objects.get(id=match_id)
        except models.Match.DoesNotExist:
            data = api.get_match('pc-na', match_id)
            match = self.parse_from_raw(data)
        serializer = serializers.MatchSerializer(match)
        return Response(serializer.data)
