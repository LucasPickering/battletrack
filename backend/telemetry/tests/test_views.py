from btcore.tests.common import BtTestCase, vcr
from telemetry import models


class TelemetryTests(BtTestCase):

    MATCH_ID = '5cf3ed16-6383-4172-bb60-8ead540d1245'

    @vcr.use_cassette('telemetry.yml')
    def get_telemetry(self, id):
        return self.get(f'/api/telemetry/{id}')

    def setUp(self):
        super().setUp()
        self.telemetry = self.get_telemetry(self.MATCH_ID)

    def test_plane(self):
        self.assertTrue('plane' in self.telemetry)

    def test_zones(self):
        # Make sure the zones are sorted in descending radius
        self.check_sorted(self.telemetry['zones'], key=lambda z: z['radius'], reverse=True)

    def test_match_not_present(self):
        # Make sure the match key isn't in the output (should be write-only)
        self.assertFalse('match' in self.telemetry)

    def test_events(self):
        # Make sure each event type appears in the telemetry data
        for type_ in models.get_all_event_types():
            self.assertIn(type_, self.telemetry['events'])

    def test_events_sorted(self):
        # Make sure all events are sorted by time
        for events in self.telemetry['events'].values():
            self.check_sorted(events, key=lambda e: e['time'])
