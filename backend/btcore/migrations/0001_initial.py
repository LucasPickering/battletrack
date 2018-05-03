# Generated by Django 2.0.4 on 2018-05-04 19:06

import btcore.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_name', models.CharField(max_length=75)),
                ('stack_count', models.PositiveSmallIntegerField()),
                ('category', models.CharField(max_length=20)),
                ('subcategory', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.CharField(max_length=36, primary_key=True, serialize=False)),
                ('shard', models.CharField(max_length=20)),
                ('mode', models.CharField(choices=[('solo', 'Solo'), ('duo', 'Duo'), ('squad', 'Squad')], max_length=10)),
                ('perspective', models.CharField(choices=[('tpp', 'TPP'), ('fpp', 'FPP')], max_length=10)),
                ('map_name', models.CharField(max_length=50)),
                ('date', models.DateTimeField()),
                ('duration', models.PositiveSmallIntegerField()),
                ('telemetry_url', models.URLField()),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.CharField(max_length=40, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('shard', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='PlayerMatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player_id', models.CharField(max_length=40)),
                ('player_name', models.CharField(max_length=30)),
                ('match_id', models.CharField(max_length=36)),
            ],
        ),
        migrations.CreateModel(
            name='RosterMatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('win_place', models.PositiveSmallIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vehicle_type', models.CharField(max_length=40)),
                ('vehicle_name', models.CharField(max_length=40)),
                ('health', models.FloatField()),
                ('fuel', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='CarePackageEvent',
            fields=[
                ('event_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.Event')),
                ('position', btcore.fields.PositionField(max_length=64)),
            ],
            bases=('btcore.event',),
        ),
        migrations.CreateModel(
            name='GameStatePeriodicEvent',
            fields=[
                ('event_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.Event')),
                ('red_zone', btcore.fields.CircleField(blank=True, max_length=85)),
                ('white_zone', btcore.fields.CircleField(blank=True, max_length=85)),
                ('blue_zone', btcore.fields.CircleField(max_length=85)),
            ],
            bases=('btcore.event',),
        ),
        migrations.CreateModel(
            name='ItemEvent',
            fields=[
                ('event_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.Event')),
                ('position', btcore.fields.PositionField(max_length=64)),
                ('item', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='btcore.Item')),
            ],
            bases=('btcore.event',),
        ),
        migrations.CreateModel(
            name='PlayerEvent',
            fields=[
                ('event_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.Event')),
                ('position', btcore.fields.PositionField(max_length=64)),
                ('health', models.FloatField()),
            ],
            bases=('btcore.event',),
        ),
        migrations.CreateModel(
            name='PlayerMatchStats',
            fields=[
                ('player_match', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='stats', serialize=False, to='btcore.PlayerMatch')),
                ('assists', models.PositiveSmallIntegerField()),
                ('boosts', models.PositiveSmallIntegerField()),
                ('damage_dealt', models.FloatField()),
                ('dbnos', models.PositiveSmallIntegerField()),
                ('death_type', models.CharField(max_length=20)),
                ('headshot_kills', models.PositiveSmallIntegerField()),
                ('heals', models.PositiveSmallIntegerField()),
                ('kill_place', models.PositiveSmallIntegerField()),
                ('kill_points', models.PositiveSmallIntegerField()),
                ('kill_streaks', models.PositiveSmallIntegerField()),
                ('kills', models.PositiveSmallIntegerField()),
                ('longest_kill', models.PositiveSmallIntegerField()),
                ('most_damage', models.PositiveSmallIntegerField()),
                ('revives', models.PositiveSmallIntegerField()),
                ('ride_distance', models.FloatField()),
                ('road_kills', models.PositiveSmallIntegerField()),
                ('team_kills', models.PositiveSmallIntegerField()),
                ('time_survived', models.PositiveSmallIntegerField()),
                ('vehicle_destroys', models.PositiveSmallIntegerField()),
                ('walk_distance', models.FloatField()),
                ('weapons_acquired', models.PositiveSmallIntegerField()),
                ('win_place', models.PositiveSmallIntegerField()),
                ('win_points', models.PositiveSmallIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Telemetry',
            fields=[
                ('match', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='btcore.Match')),
            ],
        ),
        migrations.CreateModel(
            name='VehicleEvent',
            fields=[
                ('event_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.Event')),
            ],
            bases=('btcore.event',),
        ),
        migrations.AddField(
            model_name='rostermatch',
            name='match',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rosters', to='btcore.Match'),
        ),
        migrations.AddField(
            model_name='playermatch',
            name='player_ref',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='matches', to='btcore.Player'),
        ),
        migrations.AddField(
            model_name='playermatch',
            name='roster',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='players', to='btcore.RosterMatch'),
        ),
        migrations.AlterUniqueTogether(
            name='player',
            unique_together={('id', 'shard'), ('name', 'shard')},
        ),
        migrations.CreateModel(
            name='PlayerAttackEvent',
            fields=[
                ('playerevent_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.PlayerEvent')),
                ('attack_type', models.CharField(max_length=20)),
                ('vehicle', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='btcore.Vehicle')),
                ('weapon', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='btcore.Item')),
            ],
            bases=('btcore.playerevent',),
        ),
        migrations.CreateModel(
            name='PlayerKillEvent',
            fields=[
                ('playerevent_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.PlayerEvent')),
                ('damage_type', models.CharField(max_length=40)),
                ('damage_causer', models.CharField(max_length=40)),
            ],
            bases=('btcore.playerevent',),
        ),
        migrations.CreateModel(
            name='PlayerTakeDamageEvent',
            fields=[
                ('playerevent_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.PlayerEvent')),
                ('damage', models.FloatField()),
                ('damage_type', models.CharField(max_length=40)),
                ('damage_reason', models.CharField(max_length=40)),
                ('damage_causer', models.CharField(max_length=40)),
            ],
            bases=('btcore.playerevent',),
        ),
        migrations.CreateModel(
            name='VehicleDestroyEvent',
            fields=[
                ('vehicleevent_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='btcore.VehicleEvent')),
            ],
            bases=('btcore.vehicleevent',),
        ),
        migrations.AddField(
            model_name='vehicleevent',
            name='player',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='btcore.PlayerMatch'),
        ),
        migrations.AddField(
            model_name='vehicleevent',
            name='vehicle',
            field=models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='btcore.Vehicle'),
        ),
        migrations.AlterUniqueTogether(
            name='playermatch',
            unique_together={('player_id', 'match_id')},
        ),
        migrations.AddField(
            model_name='playerevent',
            name='player',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='btcore.PlayerMatch'),
        ),
        migrations.AddField(
            model_name='itemevent',
            name='player',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='btcore.PlayerMatch'),
        ),
        migrations.AddField(
            model_name='event',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='btcore.Telemetry'),
        ),
        migrations.AddField(
            model_name='vehicledestroyevent',
            name='attacker',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='btcore.PlayerMatch'),
        ),
        migrations.AddField(
            model_name='playertakedamageevent',
            name='attacker',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='btcore.PlayerMatch'),
        ),
        migrations.AddField(
            model_name='playerkillevent',
            name='attacker',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, to='btcore.PlayerMatch'),
        ),
    ]
