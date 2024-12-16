import json
import logging
import time
from functools import wraps
from typing import Any, Dict


class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def log(self, level: str, message: str, **kwargs):
        log_data = {"message": message, "timestamp": time.time(), **kwargs}
        getattr(self.logger, level)(json.dumps(log_data))


def log_execution_time(logger: StructuredLogger):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time

            logger.log(
                "info",
                f"{func.__name__} executed",
                execution_time=execution_time,
                function=func.__name__,
            )
            return result

        return wrapper

    return decorator
