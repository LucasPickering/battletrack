import os
from .core import *

ALLOWED_HOSTS = ['api']

DEBUG = False
SECRET_KEY = os.environ['BT_SECRET_KEY']

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    )
}
