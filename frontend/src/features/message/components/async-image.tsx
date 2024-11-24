import { useMessageImage } from '../api/get-image';
import { Skeleton } from '@/components/ui/skeleton';
import { Image } from './image';

interface AsyncMessageImageProps {
    imageId: number;
    onImageLoad?: () => void;
}

interface AsyncMessageImageProps {
    imageId: number;
    images?: number[];
    currentIndex?: number;
}

export const AsyncMessageImage = ({ 
    imageId, 
    images = [], 
    currentIndex = 0 
  }: AsyncMessageImageProps) => {
    const { data, isLoading, error } = useMessageImage({ 
      image_id: imageId 
    });
  
    // Safely access image data with optional chaining
    const imageUrl = data?.data?.image;
    
    // Fetch all images in parallel if we have multiple images
    const otherImageQueries = images
      .filter(id => id !== imageId)
      .map(id => useMessageImage({ image_id: id }));
    
    // Safely combine all image URLs
    const allImageUrls = [imageUrl, ...otherImageQueries
      .map(q => q.data?.data?.image)]
      .filter(Boolean) as string[];
    
    if (error) {
      return (
        <div className="flex justify-center items-center bg-secondary w-[250px] h-[250px] text-muted-foreground">
          Failed to load image
        </div>
      );
    }
  
    if (isLoading) {
      return <Skeleton className="w-[250px] h-[250px]" />;
    }
  
    if (!imageUrl) {
      return (
        <div className="flex justify-center items-center bg-secondary w-[250px] h-[250px] text-muted-foreground">
          No image available
        </div>
      );
    }
  
    return (
      <Image
        src={imageUrl}
        images={allImageUrls}
        currentIndex={currentIndex}
      />
    );
  };