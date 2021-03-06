# Generated by Django 2.2.dev20180602145015 on 2018-06-17 15:58

from django.db import migrations, models
import django.db.models.deletion
import telemetry.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('btcore', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CarePackageEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('pos', telemetry.fields.Position3Field()),
                ('items', telemetry.fields.ItemListField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='GameStatePeriodicEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('red_zone', telemetry.fields.CircleField(blank=True)),
                ('white_zone', telemetry.fields.CircleField(blank=True)),
                ('blue_zone', telemetry.fields.CircleField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ItemAttachEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('item', telemetry.fields.ItemField()),
                ('child_item', telemetry.fields.ItemField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ItemEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('item', telemetry.fields.ItemField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PlayerAttackEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('attack_type', models.CharField(max_length=20)),
                ('weapon', telemetry.fields.ItemField()),
                ('vehicle', telemetry.fields.VehicleField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PlayerKillEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('attacker', telemetry.fields.EventPlayerField(blank=True)),
                ('damage_type', models.CharField(max_length=40)),
                ('damage_causer', models.CharField(max_length=40)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PlayerPositionEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PlayerTakeDamageEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('attacker', telemetry.fields.EventPlayerField(blank=True)),
                ('damage_type', models.CharField(max_length=40)),
                ('damage_causer', models.CharField(max_length=40)),
                ('damage', models.FloatField()),
                ('damage_reason', models.CharField(max_length=40)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Telemetry',
            fields=[
                ('match', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='btcore.Match')),
                ('plane', telemetry.fields.RayField()),
                ('zones', telemetry.fields.CircleListField()),
            ],
        ),
        migrations.CreateModel(
            name='VehicleDestroyEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('vehicle', telemetry.fields.VehicleField()),
                ('attacker', telemetry.fields.EventPlayerField(blank=True)),
                ('telemetry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicledestroyevents', to='telemetry.Telemetry')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='VehicleEvent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(max_length=20)),
                ('time', models.FloatField()),
                ('player', telemetry.fields.EventPlayerField()),
                ('vehicle', telemetry.fields.VehicleField()),
                ('telemetry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicleevents', to='telemetry.Telemetry')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='playertakedamageevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playertakedamageevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='playerpositionevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playerpositionevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='playerkillevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playerkillevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='playerattackevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playerattackevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='itemevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itemevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='itemattachevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itemattachevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='gamestateperiodicevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gamestateperiodicevents', to='telemetry.Telemetry'),
        ),
        migrations.AddField(
            model_name='carepackageevent',
            name='telemetry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='carepackageevents', to='telemetry.Telemetry'),
        ),
    ]
