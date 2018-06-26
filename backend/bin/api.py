import os

import django_cli  # Set up django

from btcore.devapi import DevAPI


if __name__ == '__main__':
    api = DevAPI(os.environ['BT_DEV_API_KEY'])
