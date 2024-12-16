import hashlib
import json
from functools import wraps
from typing import Callable

from django.core.cache import cache


class CacheService:
    @staticmethod
    def cache_key(prefix: str, *args, **kwargs) -> str:
        """Generate a unique cache key based on arguments"""
        key_dict = {"args": args, "kwargs": kwargs}
        key_str = json.dumps(key_dict, sort_keys=True)
        return f"{prefix}:{hashlib.md5(key_str.encode()).hexdigest()}"

    @staticmethod
    def cache_decorator(prefix: str, timeout: int = 3600):
        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = CacheService.cache_key(prefix, *args, **kwargs)

                # Try to get from cache
                cached_result = cache.get(cache_key)
                if cached_result is not None:
                    return cached_result

                # Execute function and cache result
                result = await func(*args, **kwargs)
                cache.set(cache_key, result, timeout)
                return result

            return wrapper

        return decorator


# Usage example in prompt service:
@CacheService.cache_decorator("prompt_template", timeout=3600)
async def get_prompt_template(style: str = "") -> str:
    # Your existing code here
    pass
