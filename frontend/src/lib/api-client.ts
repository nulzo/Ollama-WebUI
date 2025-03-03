import { useErrorStore } from '@/components/errors/error-store';
import { useNotifications } from '@/components/notification/notification-store';
import { env } from '@/config/env';
import urlJoin from 'url-join';

type RequestConfig = {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  maxContentLength?: number;
  maxBodyLength?: number;
};

interface StreamChunk {
  content?: string;
  status?: 'generating' | 'cancelled' | 'error';
  error?: string;
}

function authRequestHeaders(): Headers {
  const headers = new Headers({
    Accept: 'application/json',
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
    const headers = new Headers();

    // Set default headers
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', isStreaming ? 'text/event-stream' : 'application/json');

    // Add any custom headers from config
    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.set('Authorization', `Token ${token}`);
    }

    // For debugging, convert Headers to plain object and log everything
    console.log('Debug Auth:', {
      token: token,
      headers: Object.fromEntries(headers.entries()),
      isStreaming: isStreaming
  });

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'Network response was not ok';
      let errorData;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      // Show toast notification
      // useNotifications.getState().addNotification({
      //   type: 'error',
      //   title: `Error ${response.status}`,
      //   message: errorMessage,
      // });

      useErrorStore.getState().showError({
        status: response.status,
        message: errorMessage,
      });

      // Handle unauthorized access
      if (response.status === 401) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirectTo') || window.location.pathname;
        window.location.href = '/login';
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

    // Debug URL construction
    console.log('API URL construction:', { 
      baseURL: this.baseURL, 
      endpoint, 
      base,
      fullURL: urlJoin(base, endpoint).replace(/([^:]\/)\/+/g, '$1')
    });

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

    console.log('Making GET request to:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: authRequestHeaders(),
      credentials: 'include',
    });

    console.log('GET response status:', response.status);
    await this.handleResponse(response);
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    try {
      console.log('POST Request Data:', data);
      console.log('Making POST request to:', endpoint, 'with data:', data);

      // Get headers but handle FormData specially
      const headers = this.getHeaders(config);
      
      // If data is FormData, don't set Content-Type header (browser will set it with boundary)
      // and don't stringify the body
      const isFormData = data instanceof FormData;
      if (isFormData) {
        headers.delete('Content-Type');
      }

      const response = await fetch(this.getFullURL(endpoint), {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });

      console.log('POST Response:', response);

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

  async streamCompletion(
    data: unknown,
    onChunk: (chunk: string | StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      console.log('Starting streamCompletion with data:', data);
      const response = await fetch(this.getFullURL('/completions/chat/'), {
        method: 'POST',
        headers: this.getHeaders({
          headers: {
            Accept: 'text/event-stream',
            'Content-Type': 'application/json',
          }
        }),
        credentials: 'include',
        body: JSON.stringify(data),
        signal,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stream response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
  
      console.log('Stream response OK, starting to read chunks');
      const reader = response.body?.getReader();
      if (!reader) {
        console.error('No reader available from response');
        return;
      }
  
      const decoder = new TextDecoder();
      let buffer = '';
  
      // Set up abort handler to properly close the reader
      if (signal) {
        signal.addEventListener('abort', () => {
          console.log('AbortController signal triggered, closing reader');
          reader.cancel('User cancelled the request').catch(err => {
            console.error('Error cancelling reader:', err);
          });
        });
      }
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream reading complete');
          break;
        }
  
        // Decode the chunk and add to buffer
        const text = decoder.decode(value, { stream: true });
        buffer += text;
        console.log('Received raw chunk:', text);
  
        // Split on newlines, keeping any partial line in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
  
        for (const line of lines) {
          // Skip empty lines
          if (!line.trim()) continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              if (!jsonStr.trim()) continue;
              
              const data = JSON.parse(jsonStr);
              console.log('Parsed chunk data:', data);
              
              // Pass the entire chunk object to the callback
              onChunk(data);
              
              // If this is a cancellation, we need to make sure it's processed
              if (data.status === 'cancelled') {
                console.log('Received cancellation status from server');
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
      
      // Process any remaining data in the buffer
      if (buffer.trim() && buffer.startsWith('data: ')) {
        try {
          const jsonStr = buffer.slice(6);
          if (jsonStr.trim()) {
            const data = JSON.parse(jsonStr);
            console.log('Parsed final chunk data:', data);
            onChunk(data);
          }
        } catch (e) {
          console.error('Error parsing final SSE data:', e);
        }
      }
    } catch (error: any) {
      console.error('Stream error:', error);
      if (error.name === 'AbortError') {
        console.log('Stream aborted by client');
        throw error;
      }
      throw error;
    }
  }
}

export const api = new ApiClient(urlJoin(env.BACKEND_API_VERSION));

export default api;
