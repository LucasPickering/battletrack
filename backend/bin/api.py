import argparse

import django_cli  # Set up django

from btcore.devapi import DevAPI


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('key_file')
    args = parser.parse_args()
    api = DevAPI.from_file(args.key_file)
