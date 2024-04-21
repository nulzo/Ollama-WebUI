import {AxiosInstance, AxiosResponse} from 'axios';
import {useQuery} from "@tanstack/react-query";
import axiosInstance from "./axiosSettings.ts";

interface Data {
    // Define your API response type here
}

interface Response {
    data: Data | undefined;
    error: Error | null;
    isPending: boolean;
    isError: boolean;
}

interface Messages {
    role: string
    content: string
}

interface Chat {
    model: string;
    messages?: Messages;
    stream: boolean;
}

const useOllama = (chat: Chat): Response => {
    const axiosClient: AxiosInstance = axiosInstance;
    const { isPending, isError, data, error }: Response = useQuery(
        {
            queryKey: ['ollamaResponse'],
            queryFn: async () => {
                const response: AxiosResponse<Data> = await axiosClient.post('/chat', chat);
                return response.data;
            }
        });
    return { isPending, isError, data, error };
};

export default useOllama;
