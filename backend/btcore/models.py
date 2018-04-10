from django.core import validators
from django.db import models


class Match(models.Model):
    mid = models.CharField(primary_key=True, max_length=100)
    players = models.ManyToManyField('Player', through='PlayerMatch')


class Player(models.Model):
    pid = models.CharField(primary_key=True, max_length=100)
    matches = models.ManyToManyField('Match', through='PlayerMatch', related_name='players')


class PlayerMatch(models.Model):
    player = models.ForeignKey(Player)
    match = models.ForeignKey(Match)
    placement = models.IntegerField(validators=[validators.MinValueValidator(1),
                                                validators.MaxValueValidator(500)])


class Telemetry(models.Model):
    match = models.ForeignKey(Match)
