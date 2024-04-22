import axios, {AxiosInstance} from 'axios';

const OLLAMA_SETTINGS = {
    endpoint: '/api',
    host: 'http://192.168.0.25',
    port: '11434',
}

const axiosInstance: AxiosInstance = axios.create({
    baseURL: `${OLLAMA_SETTINGS.host}:${OLLAMA_SETTINGS.port}${OLLAMA_SETTINGS.endpoint}`,
    timeout: 45000,
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
});

export default axiosInstance;
