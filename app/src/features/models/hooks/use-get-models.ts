import {queryOptions, useQuery} from '@tanstack/react-query';
import { ollama } from '@/services/provider/ollama';


export const getModels = () => {
    return queryOptions({
        queryKey: ['model'],
        queryFn: () => {
            return ollama.list();
        },
    });
};

export const useGetModels = () => {
    return useQuery({
        ...getModels(),
    });
};
