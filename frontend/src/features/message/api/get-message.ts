import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';
import { Message } from '@/features/message/types/message';

export const getMessage = ({ messageID }: { messageID: string }): Promise<{ data: Message }> => {
  return api.get(`/messages/${messageID}`);
};

export const getMessageQueryOptions = (messageID: string) => {
  return queryOptions({
    queryKey: ['messages', messageID],
    queryFn: () => getMessage({ messageID }),
  });
};

type UseMessageOptions = {
  conversationID: string;
  queryConfig?: QueryConfig<typeof getMessageQueryOptions>;
};

export const useMessage = ({ conversationID, queryConfig }: UseMessageOptions) => {
  return useQuery({
    ...getMessageQueryOptions(conversationID),
    ...queryConfig,
  });
};
