import base64
import logging
from typing import List, Union
from django.core.files.base import ContentFile
from datetime import datetime


class ImageService:
    """
    Handles image processing operations for chat messages.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def process_images(self, images) -> list:
        """Process a list of image strings into bytes"""
        try:
            if not images:
                return None
            return [
                f"data:image/jpeg;base64,{base64.b64encode(img).decode('utf-8')}" for img in images
            ]
        except Exception as e:
            self.logger.warning(f"Error processing image: {str(e)}")
            return None

    def _process_single_image(self, image_str: str) -> bytes:
        """Process a single image string into bytes"""
        try:
            # Split on comma and take second part (the actual base64 data)
            base64_data = image_str.split(",")[1]
            # Convert base64 to bytes
            return base64.b64decode(base64_data)
        except Exception as e:
            self.logger.warning(f"Error processing individual image: {str(e)}")
            return None
        
    def process_images_for_storage(self, images: List[str], message_id: str) -> List[tuple]:
        """
        Process images for database storage.
        Returns list of tuples (filename, ContentFile)
        """
        if not images:
            return []

        processed_images = []
        for index, image_data in enumerate(images):
            try:
                if not isinstance(image_data, str) or not image_data.startswith('data:'):
                    self.logger.warning(f"Invalid image format for message {message_id}")
                    continue

                format_data, base64_data = image_data.split(';base64,')
                ext = format_data.split('/')[-1].lower()
                if ext == 'jpeg':
                    ext = 'jpg'

                filename = f"message_{message_id}_{index}_{datetime.now().timestamp()}.{ext}"
                image_content = ContentFile(
                    base64.b64decode(base64_data),
                    name=filename
                )
                processed_images.append((filename, image_content))
                
            except Exception as e:
                self.logger.error(f"Error processing image {index}: {str(e)}")
                continue

        return processed_images

    def process_images_for_llm(self, images: List[Union[str, bytes]]) -> List[str]:
        """
        Process images for LLM consumption.
        Returns list of base64 strings without data URI prefix.
        """
        if not images:
            return []

        processed_images = []
        for image in images:
            try:
                if isinstance(image, bytes):
                    # Convert bytes to base64
                    processed_images.append(base64.b64encode(image).decode('utf-8'))
                elif isinstance(image, str):
                    # Handle data URI format
                    if image.startswith('data:'):
                        processed_images.append(image.split(',')[1])
                    else:
                        processed_images.append(image)
            except Exception as e:
                self.logger.error(f"Error processing image for LLM: {str(e)}")
                continue

        return processed_images

    def get_image_as_base64(self, image_file) -> str:
        """
        Convert a file-like image object to base64 data URI
        """
        try:
            image_file.seek(0)
            image_bytes = image_file.read()
            image_data = base64.b64encode(image_bytes).decode("utf-8")
            return f"data:image/jpeg;base64,{image_data}"
        except Exception as e:
            self.logger.error(f"Error converting image to base64: {str(e)}")
            return None
