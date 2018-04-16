import itertools
import logging
import time

from django.conf import settings

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
