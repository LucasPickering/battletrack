import itertools
import logging
import time
from collections import OrderedDict

from django.conf import settings

# Django expects a tuple of (DB name, human-readable name) for each of these
SHARDS = OrderedDict((shard, shard.upper()) for shard in [
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
])
GAME_MODES = OrderedDict((gm, gm.capitalize()) for gm in ['solo', 'duo', 'squad'])
PERSPECTIVES = OrderedDict((persp, persp.upper()) for persp in ['fpp', 'tpp'])
MAPS = OrderedDict([
    ('Erangel_Main', 'Erangel'),
    ('Desert_Main', 'Miramar'),
])

MATCH_ID_LENGTH = 36
PLAYER_ID_LENGTH = 40
ROSTER_ID_LENGTH = 36

logger = logging.getLogger(settings.BT_LOGGER_NAME)


def timed(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()  # Start the clock
        rv = func(*args, **kwargs)  # Call the function
        elapsed = time.time() - start_time  # Stop the clock

        args_strs = (str(arg) for arg in args)
        kwargs_strs = (f'{k}={v}' for k, v in kwargs.items())
        arg_str = ','.join(itertools.chain(args_strs, kwargs_strs))
        logger.debug(f"{func.__name__}({arg_str}) took {elapsed:.3f}s")
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
        logger.debug(self._msg.format(time=f"{elapsed:.3f}s"))
