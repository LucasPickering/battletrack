#!/usr/bin/env python3

import argparse
import glob
import itertools
import os
import shutil
import subprocess
from PIL import Image

ASSETS_DIR = 'src/api-assets'

# Maps
MAP_SRC_DIR = os.path.join(ASSETS_DIR, 'Assets/Maps')
TILE_MAP_DEST_DIR = 'public/assets/maps'
TILE_SIZE = 512
ZOOM_LEVELS = 5

DELETE_PROMPT = "{path} already exists, do you want to delete it?"


def confirm_prompt(prompt, padding=0, default_yes=True):
    if args.yes:
        return True
    padding_str = ' ' * padding
    response = input(f"{padding_str}{prompt} [{'Y/n' if default_yes else 'y/N'}] ")
    return response.startswith('y') or (not response.startswith('n') and default_yes)


def pull_latest(**kwargs):
    os.chdir(ASSETS_DIR)
    old_commit = subprocess.check_output(['git', 'rev-parse', 'HEAD']).strip()
    subprocess.run(['git', 'pull', 'origin', 'master'])
    diff = subprocess.check_output(['git', 'diff', '--name-only', old_commit]).decode()
    print("\nFiles changed:")
    print(diff)


def tile_for_all_zooms(image_path, output_dir):
    print(f"Tiling {image_path} => {output_dir}")

    if os.path.exists(output_dir) and not confirm_prompt(DELETE_PROMPT.format(path=output_dir),
                                                         padding=2):
        print(f"  Skipping {image_path}")
        return

    # Delete the directory (if present) and re-make it
    try:
        shutil.rmtree(output_dir)
        print(f"  Deleted {output_dir}")
    except FileNotFoundError:
        pass
    os.makedirs(output_dir)

    # General approach: cut the full-res image into uniform tiles, downscale the full image by
    # 50%, then repeat until the image is only one tile
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
            box = (x, y, x + TILE_SIZE, y + TILE_SIZE)  # The portion of the parent image to crop

            # Build a path for the new file
            tile_x = x // TILE_SIZE
            tile_y = y // TILE_SIZE
            tile_path = os.path.join(output_dir, f'{tile_x}_{tile_y}.jpg')

            cropped = image.crop(box)
            cropped.save(tile_path, quality=95, subsampling=0)  # No compression


def tile_all(output_dir, **kwargs):
    exts = ('*.jpg', '*.png')
    all_files = itertools.chain.from_iterable(glob.glob(os.path.join(MAP_SRC_DIR, ext))
                                              for ext in exts)
    files = (f for f in all_files if 'lowres' not in f)  # Filter out lowres images
    for map_file in files:
        map_key = os.path.splitext(os.path.basename(map_file))[0]
        tile_for_all_zooms(map_file, os.path.join(output_dir, map_key))


if __name__ == '__main__':
    parser = argparse.ArgumentParser("Script to download and save PUBG assets")
    parser.add_argument('--yes', '-y', action='store_true',
                        help="Answer yes to all confirmation prompts")
    subparsers = parser.add_subparsers()

    pull_parser = subparsers.add_parser('pull', help="Pull the latest version of the assets repo")
    pull_parser.set_defaults(func=pull_latest)

    tile_parser = subparsers.add_parser('tile', help="Break map images into tiles")
    tile_parser.add_argument('--output-dir', '-o', default=TILE_MAP_DEST_DIR,
                             help="Directory to output tiled maps to")
    tile_parser.set_defaults(func=tile_all)

    script_dir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(script_dir)

    args = parser.parse_args()
    argd = vars(args)
    func = argd.pop('func')
    func(**argd)  # Run the function for the action
