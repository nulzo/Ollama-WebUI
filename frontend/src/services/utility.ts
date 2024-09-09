import { ErrorResponse } from '@/types/utility';
import { useNotifications } from '@/components/notification/notification-store.ts';

export class ResponseError extends Error {
  constructor(
    public error: string,
    public status_code: number
  ) {
    super(error);
    this.name = 'ResponseError';
    if (Error.captureStackTrace) Error.captureStackTrace(this, ResponseError);
  }
}

export const isValid = async (response: Response): Promise<void> => {
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
};

export async function* streamJSON<T = unknown>(iterator: ReadableStream<Uint8Array>): AsyncGenerator<T> {
  const decoder: TextDecoder = new TextDecoder('utf-8');
  let buffer: string = '';
  const reader: ReadableStreamDefaultReader<Uint8Array> = iterator.getReader();
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    buffer += decoder.decode(chunk);
    const parts: string[] = buffer.split('\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      yield JSON.parse(part);
    }
  }
  for (const part of buffer.split('\n').filter((p: string): boolean => p !== '')) {
    yield JSON.parse(part);
  }
}
