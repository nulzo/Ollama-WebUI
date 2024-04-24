import axios, {AxiosInstance} from 'axios';
import { OLLAMA_SETTINGS } from './ollama'

const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${OLLAMA_SETTINGS.host}:${OLLAMA_SETTINGS.port}${OLLAMA_SETTINGS.endpoint}`,
    timeout: 45000,
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
});

export default axiosInstance;
