import base64
import logging
from datetime import datetime
from typing import List, Optional, TypedDict, Literal

from django.core.files.base import ContentFile
from django.db import transaction

from features.authentication.models import CustomUser
from features.conversations.models import Conversation
from features.completions.models import Message
from features.completions.models import MessageImage
from api.utils.interfaces.base_repository import BaseRepository

class MessageType(TypedDict):
    conversation: Conversation
    content: str
    role: Literal["assistant", "user", "system"]
    user: CustomUser
    model: str
    images: List[MessageImage]
    has_citations: Optional[bool]
    citations: Optional[List[dict]]

class MessageRepository(BaseRepository[Message]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @transaction.atomic
    def create(
            self,
            conversation: Conversation,
            content: str,
            role: Literal["assistant", "user", "system"],
            user: CustomUser,
            model: str,
            images: Optional[List[MessageImage]] = None,
            generation_time: Optional[datetime] = None,
            finish_reason: Optional[str] = None,
            tokens_used: Optional[str] = None,
            provider: Optional[str] = None,
            name: Optional[str] = None,
            is_error: Optional[bool] = False,
            has_citations: Optional[bool] = False,
            citations: Optional[List[dict]] = None,
    ) -> Message:
        """
        Store a new message to the database
        """
        if images is None: images = []
        try:
            message = Message.objects.create(
                conversation=conversation,
                content=content,
                role=role,
                user=user,
                model=model,
                has_images=bool(images),
                generation_time=generation_time,
                prompt_tokens=tokens_used,
                completion_tokens=tokens_used,
                finish_reason=finish_reason,
                provider=provider,
                name=name,
                is_error=is_error,
                has_citations=has_citations,
                citations=citations,
            )

            # Process and create MessageImage instances
            if images:
                for index, base64_image in enumerate(images):
                    try:
                        # Each image should be a data URI at this point
                        # Format: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                        if not base64_image.startswith('data:'):
                            self.logger.warning(f"Invalid image format for message {message.id}")
                            continue

                        # Split the data URI to get format and base64 data
                        format_data, base64_data = base64_image.split(';base64,')
                        
                        # Get the image format (png, jpeg, etc)
                        ext = format_data.split('/')[-1].lower()
                        if ext == 'jpeg':
                            ext = 'jpg'

                        # Generate filename
                        filename = f"message_{message.id}_{index}_{datetime.now().timestamp()}.{ext}"

                        # Create file from base64 data
                        image_content = ContentFile(
                            base64.b64decode(base64_data),
                            name=filename
                        )

                        # Create MessageImage instance
                        MessageImage.objects.create(
                            message=message,
                            image=image_content,
                            order=index
                        )
                        self.logger.info(f"Successfully created image {index} for message {message.id}")

                    except Exception as e:
                        self.logger.error(
                            f"Error processing image {index} for message {message.id}: {str(e)}"
                        )
                        continue

            return message

        except Exception as e:
            self.logger.error(f"Error creating message: {str(e)}")
            raise

    def get_by_id(self, id: int) -> Optional[Message]:
        """Get a message by ID"""
        try:
            return Message.objects.get(id=id)
        except Message.DoesNotExist:
            self.logger.warning(f"Message {id} not found")
            return None

    def get_by_uuid(self, uuid: str) -> Optional[Message]:
        """Get a message by UUID"""
        try:
            return Message.objects.get(uuid=uuid)
        except Message.DoesNotExist:
            self.logger.warning(f"Message with UUID {uuid} not found")
            return None

    def list(self, filters: dict = None) -> List[Message]:
        """List messages with optional filters"""
        queryset = Message.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return queryset.order_by("created_at").all()

    def update(self, id: int, data: dict) -> Optional[Message]:
        """Update a message"""
        try:
            message = self.get_by_id(id)
            if not message:
                return None

            for key, value in data.items():
                setattr(message, key, value)
            message.save()
            return message
        except Exception as e:
            self.logger.error(f"Error updating message {id}: {str(e)}")
            return None

    def delete(self, id: int) -> bool:
        """Delete a message"""
        try:
            message = self.get_by_id(id)
            if not message:
                return False
            message.delete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting message {id}: {str(e)}")
            return False

    @transaction.atomic
    def bulk_create(self, data_list: List[dict]) -> List[Message]:
        """Create multiple messages"""
        try:
            messages = [
                Message(
                    conversation=data["conversation"],
                    content=data["content"],
                    role=data["role"],
                    model=data["model"],
                    user=data["user"],
                    has_images=bool(data.get("images", [])),
                    provider=data.get("provider"),
                    name=data.get("name"),
                    has_citations=data.get("has_citations", False),
                    citations=data.get("citations"),
                )
                for data in data_list
            ]
            return Message.objects.bulk_create(messages)
        except Exception as e:
            self.logger.error(f"Error bulk creating messages: {str(e)}")
            raise

    @transaction.atomic
    def bulk_update(self, data_list: List[dict]) -> List[Message]:
        """Update multiple messages"""
        try:
            updated_messages = []
            for data in data_list:
                if message_id := data.get("id"):
                    if updated_message := self.update(message_id, data):
                        updated_messages.append(updated_message)
            return updated_messages
        except Exception as e:
            self.logger.error(f"Error bulk updating messages: {str(e)}")
            raise

    def get_conversation_messages(self, conversation_id: int) -> List[Message]:
        """Get all messages for a conversation ordered by creation time"""
        return self.list({"conversation_id": conversation_id})

    def get_conversation_by_uuid(self, uuid: str) -> Optional[Conversation]:
        """Get a conversation by its UUID"""
        try:
            return Conversation.objects.get(uuid=uuid)
        except Conversation.DoesNotExist:
            self.logger.warning(f"Conversation with UUID {uuid} not found")
            return None
