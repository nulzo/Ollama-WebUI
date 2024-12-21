import { queryOptions, useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';
import { getMessage } from './get-message';
import { Message } from '@/types/message';

interface PaginatedResults {
  id: string;
  role: string;
  created_at: string;
  conversation: string;
  conversation_uuid: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaginatedResults[];
}

interface ApiResponse {
  success: boolean;
  meta: {
    timestamp: string;
    request_id: string;
    version: string;
  };
  status: number;
  data: Message[];
  links: {
    self: string;
  };
};

export const getMessages = (conversation_id: string, next: string | null = null): Promise<PaginatedResponse> => {
  return api.get(`/messages/`, {
    conversation: conversation_id,
    next: next,
  });
};

export const getMessagesQueryOptions = ({ conversation_id }: { conversation_id?: string } = {}) => {
  return queryOptions({
    queryKey: conversation_id ? ['messages', { conversation_id }] : ['messages'],
    queryFn: ({ pageParam }) => getMessages(conversation_id ?? '', pageParam),
  });
};

type UseMessagesOptions = {
  conversation_id?: string;
  queryConfig?: QueryConfig<typeof getMessages>;
};

export const useMessages = ({ conversation_id }: { conversation_id?: string }) => {
  const messagesQuery = useInfiniteQuery({
    queryKey: ['messages', { conversation_id }],
    queryFn: ({ pageParam }) => getMessages(conversation_id ?? '', pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const selfLink = lastPage.links?.self;
      const nextParam = selfLink ? new URLSearchParams(selfLink.split('?')[1]).get('next') : null;
      return nextParam === 'null' ? undefined : nextParam;
    },
    enabled: Boolean(conversation_id),
  });
   const messages = messagesQuery.data?.pages.flatMap(page => 
    page?.data?.results.map(message => ({
      data: {
        id: message.id,
        role: message.role,
        content: message.content,
        created_at: message.created_at,
        model: message.model,
        liked_by: message.liked_by,
        has_images: message.has_images,
        conversation_uuid: message.conversation_uuid
      }
    }))
  ) ?? [];
   return {
    messages,
    isLoading: messagesQuery.isLoading,
    fetchNextPage: messagesQuery.fetchNextPage,
    hasNextPage: messagesQuery.hasNextPage,
    isFetchingNextPage: messagesQuery.isFetchingNextPage
  };
};