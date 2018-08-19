import os
from vcr import VCR

from django.conf import settings
from django.test import Client, TestCase

from btcore import devapi

FIXTURE_DIR = 'fixtures'

vcr = VCR(
    cassette_library_dir=os.path.join(FIXTURE_DIR, 'cassettes/'),
    record_mode='new_episodes',
    match_on=['uri', 'method'],
    filter_headers=['Authorization'],
)


class BtTestCase(TestCase):
    def setUp(self):
        super().setUp()
        self.client = Client()

    def check_dict(self, d, **kwargs):
        for key, val in kwargs.items():
            self.assertEqual(val, d[key], f"Field '{key}'")

    def check_sorted(self, l, key=lambda x: x, reverse=False):
        def cmp_func(a, b):
            return (a >= b) if reverse else (a <= b)
        self.assertTrue(all(cmp_func(key(l[i]), key(l[i + 1])) for i in range(len(l) - 1)))

    def get(self, *args, **kwargs):
        return self.client.get(*args, format='json', **kwargs).json()


class ApiTests(TestCase):
    def setUp(self):
        self.api = devapi.DevAPI(settings.DEV_API_KEY)

    def test_get_bulk_empty(self):
        self.assertEqual([], self.api.get(bulk=True))
