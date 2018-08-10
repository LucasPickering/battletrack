#!/usr/bin/env python3

import argparse
import glob
import os
import requests
import shutil
import time
from PIL import Image

DOWNLOAD_DIR = 'src/api-assets'
DATA_FILES = [
    'dictionaries/telemetry/common/mapName.json',
    'dictionaries/telemetry/item/itemId.json',
    'dictionaries/telemetry/vehicle/vehicleId.json',
    'dictionaries/telemetry/damageCauserName.json',
]

MAP_DIR = 'public/assets/maps'
TILE_PATH_FORMAT = 'public/assets/maps/{map_key}/{x}_{y}.jpg'
TILE_SIZE = 256
ZOOM_LEVELS = 6


def download(file, dest_dir=DOWNLOAD_DIR):
    local_path = os.path.join(dest_dir, file)

    headers = {}
    # Attempt to check the local modified time to prevent downloading identical files
    try:
        mod_time = os.path.getmtime(local_path)
        timestamp = time.strftime('%a, %d %b %Y %H:%M:%S GMT', time.gmtime(mod_time))
        headers['If-Modified-Since'] = timestamp
    except FileNotFoundError:
        pass

    # Only download the file if the remote copy is newer. It seems like this doesn't actually work
    # because GitHub doens't respect the If-Modified-Since header
    print(f"Downloading '{file}'")
    r = requests.get(args.repo + file, headers=headers)
    r.raise_for_status()
    if r.status_code == 304:
        print("  Skipping, already latest")
    else:
        print(f"  Saving to '{local_path}'")
        os.makedirs(os.path.dirname(local_path), mode=0o755, exist_ok=True)
        with open(local_path, 'wb') as f:
            f.write(r.content)
    return local_path


def download_all():
    os.chdir(os.path.dirname(os.path.realpath(__file__)))  # Move to this script's path

    # Download data files
    for file in DATA_FILES:
        download(file)


def tile_for_all_zooms(image_path, output_dir):
    print(f"Tiling '{image_path}', saving to '{output_dir}'")
    try:
        shutil.rmtree(output_dir)
    except FileNotFoundError:
        pass
    os.makedirs(output_dir)

    image = Image.open(image_path)
    for zoom in reversed(range(ZOOM_LEVELS)):
        zoom_output_dir = os.path.join(output_dir, str(zoom))
        os.makedirs(zoom_output_dir)

        tile_image(image, zoom_output_dir)  # Generate tiles

        width, height = image.size
        image = image.copy()
        image.thumbnail((width // 2, height // 2))


def tile_image(image, output_dir):
    width, height = image.size
    for x in range(0, width, TILE_SIZE):
        for y in range(0, height, TILE_SIZE):
            box = (x, y, x + TILE_SIZE, y + TILE_SIZE)
            tile_path = os.path.join(output_dir, f'{x // TILE_SIZE}_{y // TILE_SIZE}.jpg')
            image.crop(box).save(tile_path)


def tile_all():
    glob_path = os.path.join(args.map_dir, '*.jpg')
    for map_file in glob.glob(glob_path):
        map_key = os.path.splitext(os.path.basename(map_file))[0]
        tile_for_all_zooms(map_file, os.path.join(MAP_DIR, map_key))


ACTIONS = {
    'download': download_all,
    'tile': tile_all,
}


if __name__ == '__main__':
    parser = argparse.ArgumentParser("Script to download and save PUBG assets")
    parser.add_argument('action', choices=ACTIONS.keys())
    parser.add_argument('--repo', '-r', default='https://github.com/pubg/api-assets/raw/master/',
                        help="URL of the repo to download from")
    parser.add_argument('--map-dir', '-m', default=MAP_DIR,
                        help="Directory containing map images to tile")
    args = parser.parse_args()
    func = ACTIONS[args.action]
    func()
