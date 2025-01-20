from features.tags.models import Tag
from features.tags.serializers.tag_serializer import TagSerializer
from api.utils.exceptions import ValidationError, NotFoundException

class TagService:
    def list_tags(self, user_id):
        """List all tags for a user"""
        tags = Tag.objects.filter(user_id=user_id)
        return TagSerializer(tags, many=True).data

    def get_tag(self, tag_id, user_id):
        """Get a specific tag"""
        try:
            tag = Tag.objects.get(id=tag_id, user_id=user_id)
            return TagSerializer(tag).data
        except Tag.DoesNotExist:
            raise NotFoundException("Tag not found")

    def create_tag(self, data):
        """Create a new tag"""
        serializer = TagSerializer(data=data)
        if serializer.is_valid():
            tag = Tag.objects.create(
                name=serializer.validated_data['name'],
                color=serializer.validated_data.get('color', '#808080'),
                user=data['user']
            )
            return TagSerializer(tag).data
        raise ValidationError(serializer.errors)

    def update_tag(self, tag_id, user_id, data):
        """Update a tag"""
        try:
            tag = Tag.objects.get(id=tag_id, user_id=user_id)
            serializer = TagSerializer(tag, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return serializer.data
            raise ValidationError(serializer.errors)
        except Tag.DoesNotExist:
            raise NotFoundException("Tag not found")

    def delete_tag(self, tag_id, user_id):
        """Delete a tag"""
        try:
            tag = Tag.objects.get(id=tag_id, user_id=user_id)
            tag.delete()
        except Tag.DoesNotExist:
            raise NotFoundException("Tag not found")
