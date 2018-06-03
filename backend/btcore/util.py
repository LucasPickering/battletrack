import itertools
import logging
import time

from django.conf import settings

PERSPECTIVES = ['fpp', 'tpp']
MAPS = {
    'Erangel_Main': 'Erangel',
    'Desert_Main': 'Miramar',
}

MATCH_ID_LENGTH = 36
PLAYER_ID_LENGTH = 40
ROSTER_ID_LENGTH = 36

logger = logging.getLogger(settings.BT_LOGGER_NAME)


def choices(it):
    return ((e, e) for e in it)


def timed(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()  # Start the clock
        rv = func(*args, **kwargs)  # Call the function
        elapsed = time.time() - start_time  # Stop the clock

        args_strs = (str(arg) for arg in args)
        kwargs_strs = (f'{k}={v}' for k, v in kwargs.items())
        arg_str = ','.join(itertools.chain(args_strs, kwargs_strs))
        logger.debug(f"{func.__name__}({arg_str}) took {elapsed:.4f}s")
        return rv

    # Only run the timing wrapper if debug mode is enabled
    return wrapper if settings.DEBUG else func


class Timed:
    def __init__(self, msg):
        self._msg = msg

    def __enter__(self):
        self._start = time.time()

    def __exit__(self, exc_type, exc_value, traceback):
        elapsed = time.time() - self._start
        logger.debug(self._msg.format(time=f"{elapsed:.4f}s"))
