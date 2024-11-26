import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ConversationList } from '../types/conversation';
import { ApiResponse } from '@/types/api';

export const getConversations = async (): Promise<ConversationList> => {
    const response = await api.get<ApiResponse<ConversationList>>('/conversations/');
    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch conversations');
    }
    return response.data;
};

export const getConversationsQueryOptions = () => ({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
});

export const useConversations = () => {
    return useQuery({
        ...getConversationsQueryOptions(),
        select: (data) => data.results,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};