import { OllamaOpts } from '@/types/providers/ollama';
import { Chat } from '@/types/chat';
import { MessageError } from '@/types/error';

export type Role = 'assistant' | 'user' | 'system' | 'tool';

export interface Message {
  content: string;
  role: Role;
  model: string;
  error?: MessageError | undefined;
  timestamp?: string | number;
  chat?: Chat;
  images?: Uint8Array[] | string[];
  is_liked?: boolean;
  opts?: OllamaOpts;
  messages?: Message[];
}
