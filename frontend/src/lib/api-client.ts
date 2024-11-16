import { useNotifications } from "@/components/notification/notification-store";
import { env } from "@/config/env";
import urlJoin from "url-join";

type RequestConfig = {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  maxContentLength?: number;
  maxBodyLength?: number;
};

function authRequestHeaders(): Headers {
  const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const token = localStorage.getItem('authToken');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  return headers;
}

class ApiClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string, config: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      withCredentials: true,
      maxContentLength: 200 * 1024 * 1024,
      maxBodyLength: 200 * 1024 * 1024,
      ...config,
    };
  }

  private getHeaders(config: RequestConfig = {}): Headers {
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...config.headers,
    });

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
        headers.set('Authorization', `Token ${token}`);
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.message || response.statusText;
      
      useNotifications.getState().addNotification({
        type: 'error',
        title: 'Error',
        message,
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirectTo=${currentPath}`;
      }

      throw new Error(message);
    }
    return response;
  }

  private getFullURL(endpoint: string): string {
    // Ensure baseURL is a valid URL by checking if it starts with http/https
    const base = this.baseURL.startsWith('http') 
      ? this.baseURL 
      : `${window.location.origin}/${this.baseURL}`;
      
    // Remove any double slashes (except after http:// or https://)
    return urlJoin(base, endpoint).replace(/([^:]\/)\/+/g, '$1');
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.getFullURL(endpoint));
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: authRequestHeaders(),
      credentials: 'include',
    });

    await this.handleResponse(response);
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    const isStreaming = config.headers?.Accept === 'text/event-stream';
    
    const response = await fetch(this.getFullURL(endpoint), {
        method: 'POST',
        headers: this.getHeaders({
            ...config,
            headers: {
                ...config.headers,
                'Accept': isStreaming ? 'text/event-stream' : 'application/json',
            }
        }),
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Network response was not ok');
    }

    if (isStreaming) {
        return response.body as unknown as T;
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'PUT',
      headers: authRequestHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    await this.handleResponse(response);
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'DELETE',
      headers: authRequestHeaders(),
      credentials: 'include',
    });

    await this.handleResponse(response);
    return response.json();
  }

  async streamChat(endpoint: string, data?: unknown): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'POST',
      headers: {
        ...authRequestHeaders(),
        'Accept': 'text/event-stream',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    await this.handleResponse(response);
    return response.body!;
  }
}

export const api = new ApiClient(urlJoin(env.BACKEND_API_VERSION));

export default api;