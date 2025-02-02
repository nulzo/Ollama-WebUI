import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
  Pause,
  Info,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const SCALE_FACTOR = 0.1;

  const calculateBounds = useCallback(() => {
    if (!containerRef.current || !imageRef.current)
      return {
        limits: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      };

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    if (scale <= 1) {
      return {
        limits: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
      };
    }

    const scaledWidth = imageRect.width * scale;
    const scaledHeight = imageRect.height * scale;

    const maxX = Math.max((scaledWidth - containerRect.width) / 2, 0);
    const minX = -maxX;
    const maxY = Math.max((scaledHeight - containerRect.height) / 2, 0);
    const minY = -maxY;

    return {
      limits: { minX, maxX, minY, maxY },
    };
  }, [scale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const { limits } = calculateBounds();

    setPosition({
      x: Math.min(Math.max(newX, limits.minX), limits.maxX),
      y: Math.min(Math.max(newY, limits.minY), limits.maxY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = useCallback(
    (delta: number) => {
      const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE);

      if (newScale !== scale) {
        setScale(newScale);
        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
        }
      }
    },
    [scale]
  );

  // Handle zoom with wheel
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? SCALE_FACTOR : -SCALE_FACTOR;
      handleZoom(delta);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [handleZoom]);

  // Keep position within bounds when scale changes
  useEffect(() => {
    if (isDragging) return;

    const { limits } = calculateBounds();
    const newPosition = {
      x: Math.min(Math.max(position.x, limits.minX), limits.maxX),
      y: Math.min(Math.max(position.y, limits.minY), limits.maxY),
    };

    if (newPosition.x !== position.x || newPosition.y !== position.y) {
      setPosition(newPosition);
    }
  }, [isDragging, calculateBounds, position.x, position.y]);

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

  // Reset zoom and position when closing dialog or changing images
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [isOpen, carouselIndex]);

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
          className="group relative cursor-pointer"
        >
          <img
            src={imageUrl}
            className="mb-1 rounded-lg w-full h-[250px] transition-all object-cover"
            alt="Preview"
          />
          {hasMultipleImages && (
            <div className="right-2 bottom-2 absolute bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full text-foreground text-xs">
              {images.length} images
            </div>
          )}
        </motion.div>
      </DialogTrigger>

      <DialogContent className="bg-black/50 backdrop-blur-md p-0 border-none w-screen h-screen max-w-none">
        <div
          ref={containerRef}
          className="relative flex justify-center items-center w-full h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              ref={imageRef}
              key={carouselIndex}
              src={currentImage}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: scale,
                x: position.x,
                y: position.y,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.1 },
              }}
              exit={{ opacity: 0 }}
              className="rounded-lg select-none"
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
              alt="Full size preview"
              draggable={false}
            />
          </AnimatePresence>

          {/* Controls */}
          <div className="right-0 bottom-0 left-0 absolute flex justify-between items-center p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 hover:bg-background/75"
                onClick={() => handleZoom(SCALE_FACTOR)}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 hover:bg-background/75"
                onClick={() => handleZoom(-SCALE_FACTOR)}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              {scale !== 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/50 hover:bg-background/75"
                  onClick={() => {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
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

          {/* Navigation */}
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

          {/* Info Panel */}
          <AnimatePresence>
            {showInfo && imageDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="top-4 left-4 absolute bg-background/50 backdrop-blur-xs p-4 rounded-lg text-foreground text-sm"
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
