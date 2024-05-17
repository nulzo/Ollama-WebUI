import {keepPreviousData, useQuery} from "@tanstack/react-query";

const settings = {
    endpoint: '/api/v1',
    host: 'http://127.0.0.1',
    port: 8000
};

export function useChats() {
    async function queryChats() {
        const response = await fetch(`${settings.host}:${settings.port}/${settings.endpoint}/chats`, {method: 'GET'});
        return await response.json();
    }
    const data = useQuery({
        queryKey: ["chats"],
        queryFn: () => queryChats(),
        placeholderData: keepPreviousData,
        staleTime: 30000,
    });
    if (data) {
        return data;
    }
}

