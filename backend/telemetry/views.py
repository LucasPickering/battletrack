from rest_framework import views
from rest_framework.response import Response

from . import models, serializers


class TelemetryView(views.APIView):
    queryset = models.Telemetry.objects \
        .prefetch_related(*(mt.related_name for mt in models.get_all_event_models()))
    serializer_class = serializers.TelemetrySerializer

    def get(self, request, id):
        type_filter_str = request.GET.get('eventTypes')  # Comma-separated string, or None
        type_filter = type_filter_str and type_filter_str.split(',')  # Split into list (or None)

        telemetry = self.queryset.get(match_id=id)
        serializer = self.serializer_class(telemetry, context={'types': type_filter})
        return Response(serializer.data)
