import { OllamaOpts } from '@/types/ollama';
import { Model, Parameters } from '@/types/models';

export type Theme = 'light' | 'dark' | 'system';

export interface OllamaSettings {
  endpoint?: string;
  port?: number;
  host?: string;
  is_local?: boolean;
  default_model?: Model;
  opts?: OllamaOpts;
}

export interface OpenAISettings {
  endpoint?: string;
  port?: number;
  host?: string;
  default_model?: Model;
  opts?: Parameters;
}

export interface Settings {
  ollama_settings?: OllamaSettings;
  openai_settings?: OpenAISettings;
  theme?: Theme;
}
