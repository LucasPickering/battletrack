from btcore.tests import BtTestCase, vcr

from .models import Telemetry

MATCH_ID = '1b8263d0-a4c6-4b7f-882f-ad134b458681'


class TelemetryTests(BtTestCase):
    @vcr.use_cassette()
    def test_get_telemetry(self):
        telemetry = Telemetry.objects.get(match_id=MATCH_ID)
        self.assertEqual(MATCH_ID, telemetry.match_id)
