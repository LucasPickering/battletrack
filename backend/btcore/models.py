from django.conf import settings
from django.db import models

from . import devapi
from .query import DevAPIManager

api = devapi.DevAPI.from_file(settings.DEV_API_KEY_FILE)


class Match(models.Model):
    api_getter = api.get_match  # Specifies method to fetch match from API
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=100)
    shard = models.CharField(max_length=20)
    mode = models.CharField(max_length=20)
    map_name = models.CharField(max_length=50)
    date = models.DateTimeField()
    duration = models.PositiveSmallIntegerField()
    players = models.ManyToManyField('Player', through='PlayerMatch', related_name='matches')
    telemetry_url = models.URLField()

    @classmethod
    def deser_dev_api(cls, data):
        d = data['data']
        attrs = d['attributes']
        inc = data['included']

        # Find all elements of type 'asset' in the list
        assets = list(filter(lambda e: e['type'] == 'asset', inc))
        tel_asset = assets[0]  # First asset is always telemetry metadata

        return cls.objects.create(id=d['id'],
                                  shard=attrs['shardId'],
                                  mode=attrs['gameMode'],
                                  # API doesn't always include this field, so default to None
                                  map_name=attrs.get('mapName', ''),
                                  date=attrs['createdAt'],
                                  duration=attrs['duration'],
                                  telemetry_url=tel_asset['attributes']['URL'])


class Player(models.Model):
    api_getter = api.get_player
    objects = DevAPIManager()

    id = models.CharField(primary_key=True, max_length=100)
    name = models.CharField(max_length=50)
    shard = models.CharField(max_length=20)

    @classmethod
    def deser_dev_api(cls, data):
        attrs = data['attributes']
        return cls.objects.create(id=data['id'],
                                  name=attrs['name'],
                                  shard=attrs['shardId'])


class PlayerMatch(models.Model):
    player = models.ForeignKey(Player, models.DO_NOTHING, related_name='player_matches')
    match = models.ForeignKey(Match, models.DO_NOTHING, related_name='player_matches')
    placement = models.PositiveSmallIntegerField()


class Telemetry(models.Model):
    api_getter = api.get_telemetry

    url = models.URLField()
    match = models.OneToOneField(Match, models.CASCADE, primary_key=True)
