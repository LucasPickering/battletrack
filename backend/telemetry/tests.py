import json
import os

from btcore.tests import BtTestCase, FIXTURE_DIR, vcr


class TelemetryTests(BtTestCase):

    DATA_DIR = os.path.join(FIXTURE_DIR, 'telemetry')
    MATCH_ID = 'd86e3e72-8c0e-4018-a79f-f15ece28ed89'

    def get_telemetry(self, id):
        return self.get(f'/api/telemetry/{id}')

    @vcr.use_cassette('telemetry.yml')
    def setUp(self):
        super().setUp()
        self.telemetry = self.get_telemetry(self.MATCH_ID)

    def test_telemetry_fields(self):
        self.check_dict(
            self.telemetry,
            plane={
                'start': {'x': 5551.063991561515, 'y': 373.59568033960755},
                'end': {'x': 1289.1057554883012, 'y': 5233.445848444647},
            },
            zones=[
                {
                    "radius": 2278.359469917732,
                    "pos": {
                        "x": 1731.2573272517102,
                        "y": 4972.405966312479
                    }
                },
                {
                    "radius": 1480.9336017145256,
                    "pos": {
                        "x": 1727.910898280786,
                        "y": 5612.844738323199
                    }
                },
                {
                    "radius": 740.4668008572628,
                    "pos": {
                        "x": 1176.7527572015235,
                        "y": 5479.9940566095065
                    }
                },
                {
                    "radius": 370.2334004286314,
                    "pos": {
                        "x": 1273.781158758274,
                        "y": 5822.473228607533
                    }
                },
                {
                    "radius": 185.1167002143157,
                    "pos": {
                        "x": 1316.1460007765743,
                        "y": 5754.447288225462
                    }
                },
                {
                    "radius": 92.55835010715785,
                    "pos": {
                        "x": 1320.8182284718268,
                        "y": 5746.146768838365
                    }
                },
                {
                    "radius": 46.279175053578925,
                    "pos": {
                        "x": 1294.6261811863226,
                        "y": 5720.5543706748185
                    }
                }
            ],
        )

    def test_match(self):
        self.check_dict(
            self.telemetry['match'],
            id=self.MATCH_ID,
            shard='pc-na',
            mode='duo',
            perspective='fpp',
            map={'name': 'Erangel_Main', 'size': 8000},
            date='2018-06-12T22:40:14-04:00',
            duration=1784,
            custom_match=False,
        )

    def test_events(self):
        # Load benchmark data from a JSON file
        with open(os.path.join(self.DATA_DIR, '{}-events.json'.format(self.MATCH_ID))) as f:
            golden_events = json.load(f)

        # Test the first event of each type
        for event_type, events in self.telemetry['events'].items():
            self.check_dict(events[0], **golden_events[event_type])

    def test_events_sorted(self):
        # Make sure all events are sorted by time
        for events in self.telemetry['events'].values():
            self.check_sorted(events, key=lambda e: e['time'])
