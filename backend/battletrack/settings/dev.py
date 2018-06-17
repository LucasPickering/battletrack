from .core import *

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]', 'backend']

DEBUG = True
SECRET_KEY = '(w%e*18h0$e5t$_#34!v&%92qdbjey3r$=+f@mz)b18abxnrv3'

DATABASES = {
    # Warning: Certain object creation procedures rely on the fact that Postgres returns
    # auto-generated primary keys from bulk_create. Keep that in mind if you change the backend!
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'battletrack',
        'USER': 'btuser',
        'PASSWORD': 'btpassword',
        'HOST': 'db',
        'PORT': '',
    },
}
