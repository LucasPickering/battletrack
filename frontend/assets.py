#!/usr/bin/env python3

import argparse
import os
import requests

FILES = [
    'Assets/Maps/Erangel_Main.jpg',
    'Assets/Maps/Desert_Main.jpg',
    'dictionaries/telemetry/common/mapName.json',
    'dictionaries/telemetry/item/itemId.json',
    'dictionaries/telemetry/vehicle/vehicleId.json',
    'dictionaries/telemetry/damageCauserName.json',
]

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Script to download and save PUBG assets")
    parser.add_argument('--repo', '-r', default='https://github.com/pubg/api-assets/raw/master/',
                        help="URL of the repo to download from")
    parser.add_argument('--output-dir', '-o', default='src/api-assets',
                        help="Directory to save files to (path relative to script location)")
    args = parser.parse_args()

    os.chdir(os.path.dirname(os.path.realpath(__file__)))  # Move to this script's path

    for file in FILES:
        print(f"Downloading {file}...")
        r = requests.get(args.repo + file)

        print("  Saving...")
        path = os.path.join(args.output_dir, file)
        os.makedirs(os.path.dirname(path), mode=0o755, exist_ok=True)
        with open(path, 'wb') as f:
            f.write(r.content)
