import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, Play, Pause, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '@/lib/utils';

interface ImageProps {
  src: string;
  images?: string[];
  currentIndex?: number;
}

interface ImageDetails {
  name: string;
  size: number;
  dimensions: { width: number; height: number };
}

export const Image = ({ src, images = [], currentIndex = 0 }: ImageProps) => {
  const [carouselIndex, setCarouselIndex] = useState(currentIndex);
  const [imageUrl, setImageUrl] = useState('');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse image URL
  useEffect(() => {
    try {
      const url = src.startsWith('[') ? JSON.parse(src.replace(/'/g, '"'))[0] : src;
      setImageUrl(url);
      fetchImageDetails(url);
    } catch (error) {
      console.error('Error parsing image:', error);
      setImageUrl(src);
    }
  }, [src]);

  // Fetch image details
  const fetchImageDetails = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);

      await new Promise(resolve => {
        img.onload = () => {
          setImageDetails({
            name: url.split('/').pop() || 'Unknown',
            size: blob.size,
            dimensions: { width: img.width, height: img.height },
          });
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error fetching image details:', error);
    }
  };

  const hasMultipleImages = images.length > 1;
  const currentImage = hasMultipleImages ? images[carouselIndex] : imageUrl;

  const nextImage = useCallback(() => {
    setCarouselIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCarouselIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowLeft':
          hasMultipleImages && prevImage();
          break;
        case 'ArrowRight':
          hasMultipleImages && nextImage();
          break;
        case 'i':
          setShowInfo(!showInfo);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, nextImage, prevImage, hasMultipleImages, showInfo]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;
    const timer = setInterval(nextImage, 3000);
    return () => clearInterval(timer);
  }, [isAutoScrolling, nextImage]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = imageDetails?.name || `image-${carouselIndex + 1}.jpg`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.0 }}
          whileTap={{ scale: 0.99 }}
          className="relative cursor-pointer group"
        >
          <img
            src={imageUrl}
            className="mb-1 rounded-lg w-full h-[250px] transition-all object-cover"
            alt="Preview"
          />
          {hasMultipleImages && (
            <div className="right-2 bottom-2 absolute bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-foreground text-xs">
              {images.length} images
            </div>
          )}
        </motion.div>
      </DialogTrigger>

      <DialogContent className="bg-black/50 backdrop-blur-md p-0 border-none max-w-7xl h-full">
        <div className="relative flex justify-center items-center w-full h-full">
          {/* Main Image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={carouselIndex}
              src={currentImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-lg max-w-[75vw] max-h-[75vh] object-contain"
              alt="Full size preview"
            />
          </AnimatePresence>

          {/* Control Bar */}
          <div className="right-0 bottom-0 left-0 absolute flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              {hasMultipleImages && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/50 hover:bg-background/75"
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                >
                  {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 hover:bg-background/75"
                onClick={downloadImage}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 hover:bg-background/75"
                onClick={() => setShowInfo(!showInfo)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>

            {hasMultipleImages && (
              <span className="text-foreground text-sm">
                {carouselIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="top-1/2 left-4 absolute bg-background/50 hover:bg-background/75 -translate-y-1/2"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="top-1/2 right-4 absolute bg-background/50 hover:bg-background/75 -translate-y-1/2"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="top-4 right-4 z-50 absolute bg-background/50 hover:bg-background/75"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>

          {/* Image Information Panel */}
          <AnimatePresence>
            {showInfo && imageDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="top-4 left-4 absolute bg-background/50 backdrop-blur-sm p-4 rounded-lg text-foreground text-sm"
              >
                <p className="font-medium">{imageDetails.name}</p>
                <p>
                  {imageDetails.dimensions.width} × {imageDetails.dimensions.height}px
                </p>
                <p>{formatBytes(imageDetails.size)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
