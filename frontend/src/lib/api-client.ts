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
    const isStreaming = config.headers?.Accept === 'text/event-stream';
    const headers = new Headers({
      'Content-Type': 'application/json',  // Default content type
      'Accept': isStreaming ? 'text/event-stream' : 'application/json',
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
      let errorMessage = 'Network response was not ok';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        // If parsing fails, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
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
    try {
      const response = await fetch(this.getFullURL(endpoint), {
        method: 'POST',
        headers: this.getHeaders(config),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers));
        const errorText = await response.text();
        console.error('Response body:', errorText);
        throw new Error(response.statusText || 'Network response was not ok');
      }

      if (config.headers?.Accept === 'text/event-stream') {
        return response.body as unknown as T;
      }

      return response.json();
    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
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

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'PATCH',
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