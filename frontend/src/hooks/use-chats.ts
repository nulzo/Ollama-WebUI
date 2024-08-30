import {keepPreviousData, useQuery} from "@tanstack/react-query";
import { Storage } from "@/services/storage";

export function useChats(storage: Storage) {
    const data = useQuery({
        queryKey: ["chats"],
        queryFn: () => storage.getChats(),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });
    if (data) {
        return data;
    }
}
