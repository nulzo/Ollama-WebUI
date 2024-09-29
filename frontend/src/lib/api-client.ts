import Axios, { InternalAxiosRequestConfig } from 'axios';

import { useNotifications } from '@/components/notification/notification-store';
import { env } from '@/config/env';
import urlJoin from 'url-join';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'application/json';
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: urlJoin(env.BACKEND_API_VERSION),
  withCredentials: true,
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
      const searchParams = new URLSearchParams();
      const redirectTo = searchParams.get('redirectTo');
      window.location.href = `/auth/login?redirectTo=${redirectTo}`;
    }

    return Promise.reject(error);
  }
);
