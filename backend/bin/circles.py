import argparse
import math
import pandas as pd

import django_cli  # Set up django

from btcore.models import Match
from telemetry.models import Telemetry


HARD_SHIFT_THRESHOLD = 0.6


def calc_shift_factor(c1, c2):
    # Calc distance between two circle centers
    center_dist = math.sqrt((c1.pos.x - c2.pos.x) ** 2 + (c1.pos.y - c2.pos.y) ** 2)
    return center_dist / (c1.radius - c2.radius)  # Shift distance over radius difference


def get_circles_for_telemetry(telemetry):
    events = telemetry.gamestateperiodicevents.all()
    circles = []

    last_white = None
    for event in events:
        white = event.white_zone
        if white and white != last_white:
            if last_white:
                shift_factor = calc_shift_factor(last_white, white)
                is_hard_shift = shift_factor >= HARD_SHIFT_THRESHOLD
            else:
                shift_factor = None
                is_hard_shift = None
            circles.append({
                'white': white.to_dict(),
                'shift_factor': shift_factor,
                'is_hard_shift': is_hard_shift,
            })
            last_white = white
    return {
        'date': telemetry.match.date,
        'circles': circles,
    }


def pull_data(outfile):
    # Get the Telemetry object for every Match in the DB. We have to do one get for each
    # object to make sure each Telemetry gets pulled from the API if necessary.
    telemetries = (Telemetry.objects.get(match_id=match_id)
                   for match_id in Match.objects.values_list('id', flat=True))

    matches = [get_circles_for_telemetry(tel) for tel in telemetries]

    # Put all circles in an iterator, excluding ones with no shift data
    circles = (c for match in matches for c in match['circles']
               if c['shift_factor'] is not None)

    shifts = pd.DataFrame(data=circles)
    shifts.to_pickle(args.outfile)
    print(f"Saved {len(matches)} matches, {len(shifts)} shifts to {outfile}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('outfile')
    args = parser.parse_args()

    pull_data(args.outfile)
