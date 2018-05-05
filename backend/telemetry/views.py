from rest_framework import generics

from . import models, serializers


class TelemetryView(generics.RetrieveAPIView):
    queryset = models.Telemetry.objects
    serializer_class = serializers.TelemetrySerializer
    lookup_field = 'match'
    lookup_url_kwarg = 'id'
