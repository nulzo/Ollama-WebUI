from django.core.cache import cache
from django.http import HttpResponseTooManyRequests
from rest_framework import status
from rest_framework.response import Response


class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_format = "rate_limit_{}"
        self.rate_limit = 100  # requests
        self.time_window = 3600  # seconds

    def __call__(self, request):
        if not request.user.is_authenticated:
            return self.get_response(request)

        cache_key = self.cache_format.format(request.user.id)
        request_count = cache.get(cache_key, 0)

        if request_count >= self.rate_limit:
            return HttpResponseTooManyRequests("Rate limit exceeded")

        cache.set(cache_key, request_count + 1, self.time_window)
        return self.get_response(request)
