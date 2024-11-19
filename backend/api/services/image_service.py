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
            if not isinstance(images, list):
                self.logger.warning(f"Expected list of images, got {type(images)}")
                return []

            processed_images = []
            for image_str in images:
                if processed := self._process_single_image(image_str):
                    processed_images.append(processed)

            self.logger.info(f"Processed {len(processed_images)} images")
            return processed_images

        except Exception as e:
            self.logger.warning(f"Error processing images: {str(e)}")
            return []

    def _process_single_image(self, image_str: str) -> bytes:
        """Process a single image string into bytes"""
        try:
            # Split on comma and take second part (the actual base64 data)
            base64_data = image_str.split(',')[1]
            # Convert base64 to bytes
            return base64.b64decode(base64_data)
        except Exception as e:
            self.logger.warning(f"Error processing individual image: {str(e)}")
            return None
        