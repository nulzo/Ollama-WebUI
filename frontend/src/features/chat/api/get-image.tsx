import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';

interface MessageImage {
  id: number;
  image: string; // base64 image data
  order: number;
}

export const getMessageImage = ({
  image_id,
}: {
  image_id: number;
}): Promise<{ data: MessageImage }> => {
  if (!image_id) return Promise.reject('No image ID provided');
  return api.get(`/images/${image_id}/`);
};

export const getMessageImageQueryOptions = (image_id: number) => {
  return queryOptions({
    queryKey: ['image', image_id],
    queryFn: () => getMessageImage({ image_id }),
  });
};

type UseMessageImageOptions = {
  image_id: number;
  queryConfig?: QueryConfig<typeof getMessageImage>;
};

export const useMessageImage = ({ image_id, queryConfig }: UseMessageImageOptions) => {
  const query = useQuery({
    queryKey: ['image', image_id],
    queryFn: () => getMessageImage({ image_id }),
    ...queryConfig,
    enabled: Boolean(image_id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return query;
};
