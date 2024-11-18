import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageProps {
  src: string;
  images?: string[];
  currentIndex?: number;
}

export const Image = ({ src, images = [], currentIndex = 0 }: ImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(currentIndex);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    try {
      // If it's a JSON string containing a base64, extract just the base64
      if (src.startsWith('[')) {
        // Replace single quotes with double quotes for valid JSON
        const jsonString = src.replace(/'/g, '"');
        const parsed = JSON.parse(jsonString);
        setImageUrl(parsed[0]);
      } else {
        setImageUrl(src);
      }
    } catch (error) {
      console.error('Error parsing image:', error);
      setImageUrl(src);
    }
  }, [src]);

  const hasMultipleImages = images.length > 1;
  const currentImage = hasMultipleImages ? images[carouselIndex] : src;

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = 'image.jpg';
    link.click();
  };

  return (
    <>
      <img
        src={imageUrl}
        className="h-[250px] mb-2 hover:cursor-zoom-in rounded-bl-xl rounded-t-xl"
        onClick={() => setIsModalOpen(true)}
      />
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="relative max-w-3xl w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <img src={imageUrl} alt="Enlarged view" className="w-full h-auto rounded-lg" />
            
            <div className="absolute bottom-2 left-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={downloadImage}
              >
                <Download className="h-6 w-6" />
              </Button>
            </div>

            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 text-foreground"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};