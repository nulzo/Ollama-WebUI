import { ResponseError } from '@/services/utility.ts';
import {
  HttpClient,
  HttpClientConfig,
  HttpRequestOptions,
  HttpMethod,
} from '@/types/http';
import { useNotifications } from '@/components/notification/notification-store.ts';
import { ErrorResponse } from '@/types/utility';

interface DefaultHeaders {
  'Content-Type'?: string;
  Accept?: string;
}

export class FetchWrapper implements HttpClient {
  private readonly config: HttpClientConfig;
  private readonly defaultHeaders: Headers | DefaultHeaders;

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private buildUrl(endpoint: string): string {
    return `${this.config.host}:${this.config.port}${this.config.endpoint}${endpoint}`;
  }

  private async process(
    method: HttpMethod,
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<Response> {
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const response = await fetch(this.buildUrl(endpoint), {
      ...options,
      method,
      headers,
    });

    if (!response.ok) {
      let message: string = `Error ${response.status}: ${response.statusText}`;
      useNotifications.getState().addNotification({
        type: 'error',
        title: 'Error',
        message,
      });
      if (response.headers.get('content-type')?.includes('application/json')) {
        message = ((await response.json()) as ErrorResponse)?.error || message;
      } else {
        message = (await response.text()) || message;
      }
      throw new ResponseError(message, response.status);
    }

    return response;
  }

  async get(endpoint: string, options?: HttpRequestOptions): Promise<Response> {
    return this.process('GET', endpoint, options);
  }

  async post(
    endpoint: string,
    data?: BodyInit,
    options?: HttpRequestOptions
  ): Promise<Response> {
    const isRecord = (
      input: Record<string, unknown> | BodyInit | undefined
    ): input is Record<string, unknown> | BodyInit | undefined => {
      return (
        input !== null && typeof input === 'object' && !Array.isArray(input)
      );
    };
    const cleanData: BodyInit | undefined = isRecord(data)
      ? JSON.stringify(data)
      : data;
    return this.process('POST', endpoint, { ...options, body: cleanData });
  }

  async put(
    endpoint: string,
    data?: BodyInit,
    options?: HttpRequestOptions
  ): Promise<Response> {
    return this.process('PUT', endpoint, { ...options, body: data });
  }

  async delete(
    endpoint: string,
    options?: HttpRequestOptions
  ): Promise<Response> {
    return this.process('DELETE', endpoint, options);
  }
}
