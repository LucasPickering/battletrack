import itertools
import logging
import time

from django.conf import settings

PERSPECTIVES = ['fpp', 'tpp']
MAP_SIZES = {
    'Erangel_Main': 8000,
    'Desert_Main': 8000,
    'Savage_Main': 4000,
}
SHARDS = [
    'pc-na',
    'pc-eu',
    'pc-as',
    'pc-kakao',
    'pc-krjp',
    'pc-jp',
    'pc-oc',
    'pc-ru',
    'pc-sa',
    'pc-sea',
]

MATCH_ID_LENGTH = 36
PLAYER_ID_LENGTH = 40
ROSTER_ID_LENGTH = 36

logger = logging.getLogger(settings.BT_LOGGER_NAME)


def choices(it):
    return ((e, e) for e in it)


def timed(func):
    start = time.time()
    rv = func()
    elapsed = time.time() - start
    return (rv, elapsed)


def timed_dec(func):
    def wrapper(*args, **kwargs):
        rv, elapsed = timed(lambda: func(*args, **kwargs))  # Run with a timer

        args_strs = (str(arg) for arg in args)
        kwargs_strs = (f'{k}={v}' for k, v in kwargs.items())
        arg_str = ','.join(itertools.chain(args_strs, kwargs_strs))
        logger.debug(f"{func.__name__}({arg_str}) took {elapsed:.4f}s")
        return rv

    # Only run the timing wrapper if debug mode is enabled
    return wrapper if settings.DEBUG else func


class Timed:
    def __init__(self, msg="Took {time}"):
        self._msg = msg

    def __enter__(self):
        self._start = time.time()

    def __exit__(self, exc_type, exc_value, traceback):
        elapsed = time.time() - self._start
        logger.debug(self._msg.format(time=f"{elapsed:.4f}s"))
