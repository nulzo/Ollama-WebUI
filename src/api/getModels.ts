import {AxiosInstance, AxiosResponse} from "axios";
import axiosInstance from "../settings/axios.ts";

interface Data {
    // Define your API response type here
}

async function getModels(): Promise<any> {
    const axiosClient: AxiosInstance = axiosInstance;
    const response: AxiosResponse<Data> = await axiosClient.get('/tags');
    console.log(response.data)
    return response.data;
}

export default getModels;
