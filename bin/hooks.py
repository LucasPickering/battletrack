#!/usr/bin/env python3

import argparse
import glob
import os

HOOK_DEST_DIR = '.git/hooks'

if __name__ == '__main__':
    parser = argparse.ArgumentParser("Create git hook links")
    parser.add_argument('hook_dir', nargs='?', default='hooks')
    args = parser.parse_args()

    rel_path = os.path.relpath(args.hook_dir, start=HOOK_DEST_DIR)
    print(rel_path)

    for file in glob.glob(os.path.join(args.hook_dir, '*')):
        basename = os.path.basename(file)
        link = os.path.join(HOOK_DEST_DIR, basename)
        dest_file = os.path.join(rel_path, basename)
        print(f"{link} -> {file}")
        os.symlink(dest_file, link)
