import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { Message } from '@/types/message';
import { useMemo } from 'react';
import { useCallback } from 'react';

interface Pagination {
  page: number;
  totalPages: number;
  hasMore: boolean;
  total: number;
}

interface MessagesResponse {
  success: boolean;
  meta: {
    timestamp: string;
    request_id: string;
    version: string;
  };
  status: number;
  data: Message[];
  pagination: Pagination;
  links: {
    self: string;
    next: string | null;
    previous: string | null;
  };
}

export const getMessages = ({
  conversation_id,
  page = 1,
  limit = 10
}: {
  conversation_id: string;
  page?: number;
  limit?: number;
}): Promise<MessagesResponse> => {
  return api.get('/messages/', {
    conversation: conversation_id,
    page: page.toString(),
    limit: limit.toString()
  });
};

export const getInfiniteMessagesQueryOptions = (conversation_id: string) => {
  return infiniteQueryOptions({
    queryKey: ['messages', { conversation_id }],
    queryFn: ({ pageParam = 1 }) => {
      return getMessages({ 
        conversation_id, 
        page: pageParam as number 
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.page + 1;
    },
    initialPageParam: 1,
  });
};

export const useMessages = ({ conversation_id }: { conversation_id?: string }) => {
  const queryResult = useInfiniteQuery({
    queryKey: ['messages', { conversation_id }],
    queryFn: ({ pageParam = 1 }) => {
      return getMessages({ 
        conversation_id: conversation_id ?? '', 
        page: pageParam as number 
      });
    },
    enabled: Boolean(conversation_id),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.page + 1;
    },
    initialPageParam: 1,
    select: useCallback((data: any) => ({
      ...data,
      pages: [...data.pages].reverse().map((page: any) => ({
        ...page,
        data: [...page.data].reverse()
      }))
    }), [])  // Memoize the select function
  });

  // Memoize the flattened messages array
  const messages = useMemo(() => 
    queryResult.data?.pages.flatMap((page: any) => 
      page.data.map((message: any) => ({
        ...message
      }))
    ) ?? []
  , [queryResult.data]);

  return {
    messages,
    isLoading: queryResult.isLoading,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage
  };
};