from django.core import validators
from django.db import models


class Match(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    shard = models.CharField(max_length=20)
    players = models.ManyToManyField('Player', through='PlayerMatch')


class Player(models.Model):
    id = models.CharField(primary_key=True, max_length=100)
    matches = models.ManyToManyField('Match', through='PlayerMatch')


class PlayerMatch(models.Model):
    player = models.ForeignKey(Player, models.SET_NULL, null=True)
    match = models.ForeignKey(Match, models.SET_NULL, null=True)
    placement = models.IntegerField(validators=[validators.MinValueValidator(1),
                                                validators.MaxValueValidator(500)])


class Telemetry(models.Model):
    match = models.OneToOneField(Match, models.CASCADE, primary_key=True)
