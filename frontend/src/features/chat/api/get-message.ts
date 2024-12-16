import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';
import { Message } from '@/features/chat/types/message';

export const getMessage = ({ message_id }: { message_id: string }): Promise<{ data: Message }> => {
  if (!message_id) return Promise.reject('No message ID provided');
  return api.get(`/messages/${message_id}/`);
};

export const getMessageQueryOptions = (message_id: string) => {
  return queryOptions({
    queryKey: ['message', message_id],
    queryFn: () => getMessage({ message_id }),
  });
};

type UseMessageOptions = {
  message_id: string;
  queryConfig?: QueryConfig<typeof getMessage>;
};

export const useMessage = ({ message_id, queryConfig }: UseMessageOptions) => {
  const query = useQuery({
    queryKey: ['message', message_id],
    queryFn: () => getMessage({ message_id }),
    ...queryConfig,
    enabled: Boolean(message_id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return query;
};
