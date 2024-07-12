import { Storage } from "@/services/storage";
import {keepPreviousData, useQuery} from "@tanstack/react-query";

export function useUser(storage: Storage) {
    const data = useQuery({
        queryKey: ["settings"],
        queryFn: () => storage.getUser(),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });
    if (data) {
        return data;
    }
}