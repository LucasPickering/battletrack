#!/usr/bin/env python3

import argparse
import json
import os
import shutil
import subprocess
from PIL import Image

ASSETS_MANIFEST = 'assets-manifest.json'
DELETE_PROMPT = "{path} already exists, do you want to delete it?"


def pull_latest(assets_manifest, **kwargs):
    os.chdir(assets_manifest['api_assets_dir'])
    old_commit = subprocess.check_output(['git', 'rev-parse', 'HEAD']).strip()
    subprocess.run(['git', 'pull', 'origin', 'master'])
    diff = subprocess.check_output(['git', 'diff', '--name-only', old_commit]).decode()
    print("\nFiles changed:")
    print(diff)


def copy_static_assets(assets_dir, static_cfg):
    output_dir = static_cfg['output_dir']
    for file in static_cfg['files']:
        src = os.path.join(assets_dir, file)
        dest = os.path.join(output_dir, file)

        # Make the destination dir if necessary
        dest_dir, _ = os.path.split(dest)
        os.makedirs(dest_dir, exist_ok=True)

        print(f"Copying {src} => {dest}")
        shutil.copyfile(src, dest)


def tile_image(image, output_dir, tile_size):
    width, height = image.size
    for x in range(0, width, tile_size):
        for y in range(0, height, tile_size):
            box = (x, y, x + tile_size, y + tile_size)  # The portion of the parent image to crop

            # Build a path for the new file
            tile_x = x // tile_size
            tile_y = y // tile_size
            tile_path = os.path.join(output_dir, f'{tile_x}_{tile_y}.jpg')

            cropped = image.crop(box)
            cropped.save(tile_path, quality=95, subsampling=0)  # No compression


def tile_for_all_zooms(image_path, output_dir, zoom_levels, tile_size):
    print(f"Tiling {image_path} => {output_dir}")

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
    for zoom in reversed(range(zoom_levels)):
        zoom_output_dir = os.path.join(output_dir, str(zoom))
        os.makedirs(zoom_output_dir)

        tile_image(image, zoom_output_dir, tile_size)  # Generate tiles

        width, height = image.size
        image = image.copy()
        image.thumbnail((width // 2, height // 2))


def tile_maps(assets_dir, maps_cfg):
    input_dir = os.path.join(assets_dir, maps_cfg['input_dir'])
    output_dir = maps_cfg['output_dir']
    zoom_levels = maps_cfg['zoom_levels']
    tile_size = maps_cfg['tile_size']
    for map_name, file_name in maps_cfg['files'].items():
        tile_for_all_zooms(os.path.join(input_dir, file_name),
                           os.path.join(output_dir, map_name),
                           zoom_levels, tile_size)


def update_all(assets_manifest, **kwargs):
    assets_dir = assets_manifest['api_assets_dir']
    copy_static_assets(assets_dir, assets_manifest['static'])
    tile_maps(assets_dir, assets_manifest['maps'])


if __name__ == '__main__':
    parser = argparse.ArgumentParser("Script to download and save PUBG assets")
    parser.add_argument('--yes', '-y', action='store_true',
                        help="Answer yes to all confirmation prompts")
    subparsers = parser.add_subparsers()

    pull_parser = subparsers.add_parser('pull', help="Pull the latest version of the assets repo")
    pull_parser.set_defaults(func=pull_latest)

    update_parser = subparsers.add_parser('update', help="Copy/process asset files into the repo")
    update_parser.set_defaults(func=update_all)

    # tile_parser = subparsers.add_parser('tile', help="Break map images into tiles")
    # tile_parser.add_argument('--output-dir', '-o', default=TILE_MAP_DEST_DIR,
    #                          help="Directory to output tiled maps to")
    # tile_parser.set_defaults(func=tile_all)

    script_dir = os.path.dirname(os.path.realpath(__file__))
    os.chdir(script_dir)

    args = parser.parse_args()
    argd = vars(args)
    func = argd.pop('func')

    # Load manifest file
    with open(ASSETS_MANIFEST) as f:
        assets_manifest = json.load(f)

    func(assets_manifest=assets_manifest, **argd)  # Run the function for the action
