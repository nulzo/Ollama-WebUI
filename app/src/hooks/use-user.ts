import {keepPreviousData, useQuery} from "@tanstack/react-query";

const settings = {
    endpoint: '/api/v1',
    host: 'http://127.0.0.1',
    port: 8000
};

export function useUser() {
    async function queryChats() {
        const response = await fetch(`${settings.host}:${settings.port}/${settings.endpoint}/settings`, {method: 'GET'});
        return await response.json();
    }
    const data = useQuery({
        queryKey: ["settings"],
        queryFn: () => queryChats(),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });
    if (data) {
        return data;
    }
}