import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, X, Play, Pause, Info } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '@/lib/utils.ts'; // Utility to format bytes to readable format

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(currentIndex);
  const [imageUrl, setImageUrl] = useState('');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);

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
      const img = new Image();
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
      if (!isModalOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsModalOpen(false);
          break;
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
  }, [isModalOpen, nextImage, prevImage, hasMultipleImages, showInfo]);

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
    <>
      {/* Preview Thumbnail */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group"
      >
        <img
          src={imageUrl}
          className="mb-1 rounded-lg w-full h-[250px] transition-all object-cover"
          onClick={() => setIsModalOpen(true)}
        />
        {hasMultipleImages && (
          <div className="right-2 bottom-2 absolute bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
            {images.length} images
          </div>
        )}
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-[9999] fixed inset-0 flex justify-center items-center bg-black/90 backdrop-blur-sm image-modal"
            onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}
          >
            <div className="relative flex justify-center items-center p-4 w-full h-full image-modal">
              {/* Main Image Container */}
              <div className="relative flex justify-center items-center w-full max-w-7xl h-full image-modal">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={carouselIndex}
                    src={currentImage}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="rounded-lg max-w-full max-h-[90vh] image-modal object-contain"
                  />
                </AnimatePresence>

                {/* Control Bar */}
                <div className="right-0 bottom-0 left-0 absolute flex justify-between items-center bg-gradient-to-t from-black/50 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    {hasMultipleImages && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/10 hover:bg-white/20"
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                      >
                        {isAutoScrolling ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/10 hover:bg-white/20"
                      onClick={downloadImage}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/10 hover:bg-white/20"
                      onClick={() => setShowInfo(!showInfo)}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>

                  {hasMultipleImages && (
                    <span className="text-sm text-white/90">
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
                      className="top-1/2 left-4 absolute bg-white/10 hover:bg-white/20 -translate-y-1/2"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="top-1/2 right-4 absolute bg-white/10 hover:bg-white/20 -translate-y-1/2"
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
                  className="top-4 right-4 absolute bg-white/10 hover:bg-white/20"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>

                {/* Image Information Panel */}
                <AnimatePresence>
                  {showInfo && imageDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="top-4 left-4 absolute bg-black/50 backdrop-blur-sm p-4 rounded-lg text-sm text-white"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
