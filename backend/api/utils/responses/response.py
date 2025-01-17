import uuid
from datetime import datetime

from django.conf import settings
from rest_framework.response import Response


def api_response(data=None, error=None, status=200, meta=None, pagination=None, links=None):
    response_data = {
        "success": error is None,
        "meta": meta or {
            "timestamp": datetime.now().isoformat(),
            "request_id": str(uuid.uuid4()),
            "version": "1.0",
        },
        "status": status,
    }

    if data is not None:
        response_data["data"] = data

    if error is not None:
        response_data["error"] = {
            "code": error.get("code", "UNKNOWN_ERROR"),
            "message": error.get("message", "An unknown error occurred"),
            "details": error.get("details") if settings.DEBUG else None,
        }

    if pagination:
        response_data["pagination"] = pagination

    if links:
        response_data["links"] = links

    return Response(response_data, status=status)
