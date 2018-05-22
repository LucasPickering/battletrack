from rest_framework import views
from rest_framework.response import Response

from . import models, serializers


class TelemetryView(views.APIView):
    queryset = models.Telemetry.objects.select_related('match')
    serializer_class = serializers.TelemetrySerializer

    def get(self, request, id):
        telemetry = self.queryset.get(match_id=id)
        serializer = self.serializer_class(telemetry, context=request.GET)
        return Response(serializer.data)
