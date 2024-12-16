import base64
import logging


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
