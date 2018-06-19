from django.test import TestCase

from btcore.tests import vcr, CASSETTE_FILE, MATCH_ID

from .models import Telemetry


class TelemetryTests(TestCase):
    @vcr.use_cassette(CASSETTE_FILE)
    def test_get_telemetry(self):
        telemetry = Telemetry.objects.get(match_id=MATCH_ID)
        self.assertEqual(MATCH_ID, telemetry.match_id)
