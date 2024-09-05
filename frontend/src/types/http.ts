export interface HttpClientConfig {
  host: string;
  port: number;
  endpoint: string;
}

export interface HttpRequestOptions extends RequestInit {
  body?: BodyInit | null;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpClient {
  get(endpoint: string, options?: HttpRequestOptions): Promise<Response>;
  post(endpoint: string, data?: BodyInit, options?: HttpRequestOptions): Promise<Response>;
  put(endpoint: string, data?: BodyInit, options?: HttpRequestOptions): Promise<Response>;
  delete(endpoint: string, options?: HttpRequestOptions): Promise<Response>;
}
