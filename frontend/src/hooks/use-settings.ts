import {keepPreviousData, useQuery} from "@tanstack/react-query";
import { Storage } from "@/services/storage";

export function useSettings(storage: Storage) {
    const data = useQuery({
        queryKey: ["settings"],
        queryFn: () => storage.getSettings(),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });
    if (data) {
        return data;
    }
}
