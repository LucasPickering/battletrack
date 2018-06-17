import os
from .core import *

ALLOWED_HOSTS = []

DEBUG = False
SECRET_KEY = os.environ['BT_SECRET_KEY']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'battletrack',
        'USER': 'btuser',
        'PASSWORD': os.environ['BT_DB_PASSWORD'],
        'HOST': os.environ['BT_DB_HOST'],
        'PORT': '',
    },
}
