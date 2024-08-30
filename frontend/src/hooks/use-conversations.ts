import {queryOptions, useQuery} from '@tanstack/react-query';
import { chatService } from '@/services/storage/client';


export const getConversations = () => {
    return queryOptions({
        queryKey: ['conversations'],
        queryFn: () => {
            return chatService.fetchChats();
        },
    });
};

export const useConversations = () => {
    return useQuery({
        ...getConversations(),
    });
};
