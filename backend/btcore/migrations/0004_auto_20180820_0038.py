# Generated by Django 2.0.7 on 2018-08-20 00:38

import btcore.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('btcore', '0003_auto_20180807_0103'),
    ]

    operations = [
        migrations.AlterField(
            model_name='playermatch',
            name='player',
            field=models.ForeignKey(db_constraint=False, on_delete=btcore.models.DELETE_PLAYERMATCH_FROM_PLAYER, related_name='matches', to='btcore.Player'),
        ),
        migrations.AlterField(
            model_name='playermatch',
            name='roster',
            field=models.ForeignKey(null=True, on_delete=btcore.models.DELETE_PLAYERMATCH_FROM_ROSTERMATCH, related_name='players', to='btcore.RosterMatch'),
        ),
    ]
