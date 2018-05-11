import argparse
import django
import numpy as np
import os
import pandas as pd
import pickle
import sys
from collections import defaultdict
sys.path.append('')  # Add cwd to path so we can import battletrack and its apps

# Configure Django settings
import battletrack.settings
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "battletrack.settings"
)
django.setup()

from btcore.models import Match
from telemetry.models import Telemetry
import telemetry.serializers


def pull_data(outfile):
    matches = Match.objects.select_related('telemetry')
    tel_qset = Telemetry.objects.prefetch_related('playerkillevents')
    kills_by_map = defaultdict(list)
    for match in matches:
        # Get the Telemetry object for every Match in the DB. We have to do one get for each
        # object to make sure each Telemetry gets pulled from the API if necessary.
        kills_by_map[match.map_name] += tel_qset.get(match_id=match.id).playerkillevents \
            .values_list('time', flat=True)

    kills = {k: np.array(v) for k, v in kills_by_map.items()}
    with open(outfile, 'wb') as f:
        pickle.dump(kills, f)
    print(f"Saved {len(matches)} matches to {outfile}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('outfile')
    args = parser.parse_args()

    pull_data(args.outfile)
