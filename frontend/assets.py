#!/usr/bin/env python3

import argparse
import os
import requests

IMAGE_DIR = 'public'
DATA_DIR = 'src/api-assets'

FILES = {
    'Assets/Maps/Erangel_Main.jpg': IMAGE_DIR,
    'Assets/Maps/Desert_Main.jpg': IMAGE_DIR,
    'dictionaries/telemetry/common/mapName.json': DATA_DIR,
    'dictionaries/telemetry/item/itemId.json': DATA_DIR,
    'dictionaries/telemetry/vehicle/vehicleId.json': DATA_DIR,
    'dictionaries/telemetry/damageCauserName.json': DATA_DIR,
}

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Script to download and save PUBG assets")
    parser.add_argument('--repo', '-r', default='https://github.com/pubg/api-assets/raw/master/',
                        help="URL of the repo to download from")
    args = parser.parse_args()

    os.chdir(os.path.dirname(os.path.realpath(__file__)))  # Move to this script's path

    for file, dest_dir in FILES.items():
        print(f"Downloading {file}...")
        r = requests.get(args.repo + file)

        path = os.path.join(dest_dir, file)
        print(f"  Saving to {path}...")
        os.makedirs(os.path.dirname(path), mode=0o755, exist_ok=True)
        with open(path, 'wb') as f:
            f.write(r.content)
