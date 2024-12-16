import { useMessageImage } from '../api/get-image.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Image } from './image.tsx';

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
  currentIndex = 0,
}: AsyncMessageImageProps) => {
  const { data: mainImageData } = useMessageImage({ image_id: imageId });

  // Fetch all images in parallel
  const otherImageQueries = images
    .filter(id => id !== imageId)
    .map(id => useMessageImage({ image_id: id }));

  // Combine all image URLs
  const allImageUrls = [
    mainImageData?.data?.image,
    ...otherImageQueries.map(q => q.data?.data?.image),
  ].filter(Boolean) as string[];

  if (!mainImageData?.data?.image) {
    return <Skeleton className="w-[250px] h-[250px]" />;
  }

  return <Image src={mainImageData.data.image} images={allImageUrls} currentIndex={currentIndex} />;
};
