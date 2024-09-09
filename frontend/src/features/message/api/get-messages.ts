import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query.ts';
import { Message } from '@/features/message/types/message';
import { Meta } from '@/types/api.ts';

export const getMessages = (
  c: string
): Promise<{
  data: Message[];
  meta: Meta;
}> => {
  return api.get(`/messages/`, {
    params: {
      c,
    },
  });
};

export const getMessagesQueryOptions = ({ conversation_id }: { conversation_id?: string } = {}) => {
  return queryOptions({
    queryKey: conversation_id ? ['messages', { conversation_id }] : ['messages'],
    queryFn: () => getMessages(conversation_id ?? ''),
  });
};

type UseMessagesOptions = {
  conversation_id?: string;
  queryConfig?: QueryConfig<typeof getMessages>;
};

export const useMessages = ({ conversation_id, queryConfig }: UseMessagesOptions) => {
  return useQuery({
    ...getMessagesQueryOptions({ conversation_id }),
    ...queryConfig,
  });
};
