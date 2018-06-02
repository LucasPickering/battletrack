# Generated by Django 2.0.5 on 2018-06-02 20:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.CharField(max_length=36, primary_key=True, serialize=False)),
                ('shard', models.CharField(choices=[('pc-na', 'pc-na'), ('pc-eu', 'pc-eu'), ('pc-as', 'pc-as'), ('pc-kakao', 'pc-kakao'), ('pc-krjp', 'pc-krjp'), ('pc-jp', 'pc-jp'), ('pc-oc', 'pc-oc'), ('pc-ru', 'pc-ru'), ('pc-sa', 'pc-sa'), ('pc-sea', 'pc-sea')], max_length=20)),
                ('mode', models.CharField(max_length=10)),
                ('perspective', models.CharField(choices=[('fpp', 'fpp'), ('tpp', 'tpp')], max_length=10)),
                ('map_name', models.CharField(choices=[('Erangel', 'Erangel'), ('Miramar', 'Miramar')], max_length=50)),
                ('date', models.DateTimeField()),
                ('duration', models.PositiveSmallIntegerField()),
                ('telemetry_url', models.URLField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.CharField(max_length=40, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PlayerMatch',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('match_id', models.CharField(max_length=36)),
                ('player_name', models.CharField(max_length=30)),
                ('shard', models.CharField(choices=[('pc-na', 'pc-na'), ('pc-eu', 'pc-eu'), ('pc-as', 'pc-as'), ('pc-kakao', 'pc-kakao'), ('pc-krjp', 'pc-krjp'), ('pc-jp', 'pc-jp'), ('pc-oc', 'pc-oc'), ('pc-ru', 'pc-ru'), ('pc-sa', 'pc-sa'), ('pc-sea', 'pc-sea')], max_length=20)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RosterMatch',
            fields=[
                ('id', models.CharField(max_length=36, primary_key=True, serialize=False)),
                ('win_place', models.PositiveSmallIntegerField()),
                ('match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rosters', to='btcore.Match')),
            ],
            options={
                'abstract': False,
            },
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
        migrations.AddField(
            model_name='playermatch',
            name='player',
            field=models.ForeignKey(db_constraint=False, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='matches', to='btcore.Player'),
        ),
        migrations.AddField(
            model_name='playermatch',
            name='roster',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='players', to='btcore.RosterMatch'),
        ),
    ]
