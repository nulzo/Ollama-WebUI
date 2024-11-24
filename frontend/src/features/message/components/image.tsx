import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, X, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageProps {
  src: string;
  images?: string[];
  currentIndex?: number;
}

export const Image = ({ src, images = [], currentIndex = 0 }: ImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(currentIndex);
  const [imageUrl, setImageUrl] = useState('');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    try {
      if (src.startsWith('[')) {
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
  const currentImage = hasMultipleImages ? images[carouselIndex] : imageUrl;

  const nextImage = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCarouselIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'Escape':
          setIsModalOpen(false);
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen, nextImage, prevImage]);

  useEffect(() => {
    if (!isAutoScrolling) return;

    const timer = setInterval(nextImage, 3000);
    return () => clearInterval(timer);
  }, [isAutoScrolling, nextImage]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `image-${carouselIndex + 1}.jpg`;
    link.click();
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <img
          src={imageUrl} // Always show the first image as preview
          className="mb-1 rounded-t-xl rounded-bl-xl h-[250px] hover:cursor-zoom-in object-cover"
          onClick={() => setIsModalOpen(true)}
        />
        {hasMultipleImages && (
          <div className="right-4 bottom-4 absolute bg-background/50 px-2 py-1 rounded-lg text-foreground text-xs">
            {images.length} images
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-[100] fixed inset-0 flex justify-center items-center bg-black/75 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          >
            <div className="relative p-4 w-full max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="relative"
                >
                  <img 
                    src={currentImage} // Show current image in carousel
                    alt={`Image ${carouselIndex + 1}`} 
                    className="rounded-lg w-full h-auto"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="bottom-6 left-6 absolute flex items-center gap-2">
                {hasMultipleImages && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/25 hover:bg-white/50 transition-colors"
                    onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  >
                    {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/25 hover:bg-white/50 transition-colors"
                  onClick={downloadImage}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {hasMultipleImages && (
                  <span className="ml-2 text-sm text-white">
                    {carouselIndex + 1} / {images.length}
                  </span>
                )}
              </div>

              {hasMultipleImages && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="top-1/2 left-4 absolute bg-white/25 hover:bg-white/50 transition-colors -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="top-1/2 right-4 absolute bg-white/25 hover:bg-white/50 transition-colors -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="top-4 right-4 absolute bg-white/25 hover:bg-white/50 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};