from .core import *

DEBUG = True
SECRET_KEY = '(w%e*18h0$e5t$_#34!v&%92qdbjey3r$=+f@mz)b18abxnrv3'

# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    # Warning: Certain object creation procedures rely on the fact that Postgres returns
    # auto-generated primary keys from bulk_create. Keep that in mind if you change the backend!
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'battletrack',
        'USER': 'btuser',
        'PASSWORD': 'btpassword',
        'HOST': 'localhost',
        'PORT': '',
    },
}
