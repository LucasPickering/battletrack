import argparse
import django
import os
import sys
sys.path.append('')  # Add cwd to path so we can import battletrack and its apps

# Configure Django settings
import battletrack.settings
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "battletrack.settings"
)
django.setup()

from btcore.devapi import DevAPI


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('key_file')
    args = parser.parse_args()
    api = DevAPI.from_file(args.key_file)
