from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from features.tags.services.tag_service import TagService
from api.utils.exceptions import ValidationError, NotFoundException
from api.utils.responses.response import api_response

class TagViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TagService()

    def list(self, request):
        """List all tags for the authenticated user"""
        try:
            tags = self.service.list_tags(request.user.id)
            return api_response(data=tags)
        except Exception as e:
            return api_response(error={"code": "FETCH_ERROR", "message": str(e)}, status=500)

    def retrieve(self, request, pk=None):
        """Get a specific tag"""
        try:
            tag = self.service.get_tag(pk, request.user.id)
            return api_response(data=tag)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    def create(self, request):
        """Create a new tag"""
        try:
            data = {**request.data, "user": request.user}
            tag = self.service.create_tag(data)
            return api_response(data=tag, status=201)
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)

    def update(self, request, pk=None):
        """Update a tag"""
        try:
            tag = self.service.update_tag(pk, request.user.id, request.data)
            return api_response(data=tag)
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    def destroy(self, request, pk=None):
        """Delete a tag"""
        try:
            self.service.delete_tag(pk, request.user.id)
            return api_response(status=204)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)
