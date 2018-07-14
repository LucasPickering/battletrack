import os

from btcore.tests import BtTestCase, FIXTURE_DIR, vcr
from telemetry import models


class TelemetryTests(BtTestCase):

    DATA_DIR = os.path.join(FIXTURE_DIR, 'telemetry')
    MATCH_ID = '5cf3ed16-6383-4172-bb60-8ead540d1245'

    def get_telemetry(self, id):
        return self.get(f'/api/telemetry/{id}')

    @vcr.use_cassette('telemetry.yml')
    def setUp(self):
        super().setUp()
        self.telemetry = self.get_telemetry(self.MATCH_ID)

    def test_plane(self):
        self.assertTrue('plane' in self.telemetry)

    def test_zones(self):
        # Make sure the zones are sorted in descending radius
        self.check_sorted(self.telemetry['zones'], key=lambda z: z['radius'], reverse=True)

    def test_match(self):
        self.check_dict(
            self.telemetry['match'],
            id=self.MATCH_ID,
            shard='pc-eu',
            mode='squad',
            perspective='fpp',
            map={'name': 'Savage_Main', 'size': 4000},
            date='2018-07-11T12:46:57-04:00',
            duration=1380,
            custom_match=False,
        )

    def test_events(self):
        # Make sure each event type appears in the telemetry data
        for type_ in models.get_all_event_types():
            self.assertTrue(type_ in self.telemetry['events'])

    def test_events_sorted(self):
        # Make sure all events are sorted by time
        for events in self.telemetry['events'].values():
            self.check_sorted(events, key=lambda e: e['time'])
