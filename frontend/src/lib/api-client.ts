import Axios, { InternalAxiosRequestConfig } from 'axios';
import urlJoin from 'url-join';

import { useNotifications } from '@/components/notification/notification-store';
import { env } from '@/config/env';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('authToken');
  
  if (config.headers) {
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'application/json';
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: urlJoin(env.BACKEND_API_VERSION),
  withCredentials: true,
  maxContentLength: 200 * 1024 * 1024,
  maxBodyLength: 200 * 1024 * 1024, 
});

api.interceptors.request.use(authRequestInterceptor, error => {
  useNotifications.getState().addNotification({
    type: 'error',
    title: 'Network Error',
    message: 'There was an error in the request.',
  });
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    const message = error.response?.data?.message || error.message;
    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?redirectTo=${currentPath}`;
    }

    return Promise.reject(error);
  }
);

export default api;