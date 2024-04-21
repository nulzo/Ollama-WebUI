import {AxiosInstance, AxiosResponse} from "axios";
import axiosInstance from "./axiosSettings.ts";

interface Data {
    // Define your API response type here
}

export interface Messages {
    role: string
    content: string
}

export interface Chat {
    model: string;
    stream: boolean;
    messages: Messages;
}

const postChat = async (chat: Chat) => {
    const axiosClient: AxiosInstance = axiosInstance;
    const response: AxiosResponse<Data> = await axiosClient.post('/chat', chat);
    return response.data;
};

export default postChat;
