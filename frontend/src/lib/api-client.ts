import { useErrorStore } from '@/components/errors/error-store';
import { useNotifications } from '@/components/notification/notification-store';
import { env } from '@/config/env';
import urlJoin from 'url-join';
import { StreamChunk } from '@/types/api';

type RequestConfig = {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  maxContentLength?: number;
  maxBodyLength?: number;
};

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

    // Remove any double slashes (except after http:// or https://)
    return urlJoin(base, endpoint).replace(/([^:]\/)\/+/g, '$1');
  }
  
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.getFullURL(path), window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async post<T>(path: string, data?: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await fetch(this.getFullURL(path), {
      method: 'POST',
      headers: this.getHeaders(options),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async patch<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(this.getFullURL(path), {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(this.getFullURL(path), {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async streamCompletion(
    data: unknown,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = this.getFullURL('/completions/chat/');
    
    try {
      const response = await fetch(url, {
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
        let errorMessage = `HTTP error ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.error || errorMessage;
        } catch (e) {
          // If we can't parse the error as JSON, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      // Set up abort listener
      const abortListener = () => {
        console.log('Stream request aborted');
      };
      
      signal?.addEventListener('abort', abortListener);
      
      try {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Process any remaining data in the buffer
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.trim() && line.startsWith('data: ')) {
                  try {
                    const jsonData = line.slice(6).trim();
                    if (jsonData === '[DONE]') {
                      onChunk({ status: 'done' });
                    } else {
                      const parsed = JSON.parse(jsonData);
                      onChunk(parsed);
                    }
                  } catch (e) {
                    console.error('Error parsing final SSE data:', e, line);
                  }
                }
              }
            }
            break;
          }
          
          // Decode the chunk and add it to our buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete SSE messages from the buffer
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.startsWith('data: ')) {
              const jsonData = line.slice(6).trim();
              
              if (jsonData === '[DONE]') {
                onChunk({ status: 'done' });
                continue;
              }
              
              try {
                const parsed = JSON.parse(jsonData);
                
                // Handle different response formats
                if (parsed.delta && parsed.delta.content) {
                  // OpenAI-style delta format
                  onChunk({
                    content: parsed.delta.content,
                    status: 'generating'
                  });
                } else if (parsed.content !== undefined) {
                  // Direct content format
                  onChunk({
                    content: parsed.content,
                    status: parsed.status || 'generating'
                  });
                } else if (parsed.conversation_uuid) {
                  // Conversation creation
                  onChunk(parsed);
                } else if (parsed.error) {
                  // Error message
                  onChunk({
                    error: parsed.error,
                    status: 'error'
                  });
                } else if (parsed.status === 'done' || parsed.type === 'done') {
                  // Completion message
                  onChunk({
                    status: 'done',
                    message_id: parsed.message_id
                  });
                } else {
                  // Pass through any other format
                  onChunk(parsed);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e, jsonData);
                // Try to extract useful information from the raw data
                if (typeof jsonData === 'string') {
                  if (jsonData.includes('error')) {
                    onChunk({
                      error: 'Error in response: ' + jsonData.substring(0, 100),
                      status: 'error'
                    });
                  } else {
                    onChunk({
                      content: jsonData,
                      status: 'generating'
                    });
                  }
                }
              }
            }
          }
        }
      } finally {
        // Clean up the abort listener
        signal?.removeEventListener('abort', abortListener);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream request was aborted');
        onChunk({ status: 'cancelled' });
        throw error;
      }
      
      // Handle other errors
      console.error('Streaming error:', error);
      onChunk({
        error: error.message || 'Unknown error occurred',
        status: 'error'
      });
      
      throw error;
    }
  }
}

export const api = new ApiClient(urlJoin(env.BACKEND_API_VERSION));

export default api;
