import {queryOptions, useQuery} from '@tanstack/react-query';
import { conversationService } from '@/services/storage/client';

export const getMessages = (id: string) => {
    return queryOptions({
        queryKey: ['messages'],
        queryFn: () => {
            return conversationService.fetchConversation(id);
        },
    });
};

export const useGetMessages = (id: string) => {
    return useQuery({
        ...getMessages(id),
    });
};
