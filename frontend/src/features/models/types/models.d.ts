import { Message } from '@/types/ollama';

export interface GenericModelResponse {
  name: string;
  display_name: string;
  icon?: string | null;
  description?: string | null;
  api_key?: string | null;
  default_temperature?: number;
  default_max_tokens?: number;
  created_at?: Date;
}

export type Provider = 'ollama' | 'openai' | 'anthropic' | 'google';

export interface StandardModel {
  id: string;                     // model identifier
  name: string;                   // model name
  model: string;                  // display name of the model
  max_input_tokens: number;       // maximum allowed input tokens (default: 2048)
  max_output_tokens: number;      // maximum allowed output tokens (default: 2048)
  vision_enabled: boolean;        // whether the model supports vision (default: false)
  embedding_enabled: boolean;     // whether the model supports embeddings (default: false)
  tools_enabled: boolean;         // whether the model supports tools (default: false)
  provider: Provider;
}

export interface OllamaChatResponse {
  model?: string;
  uuid?: string;
  created_at?: Date;
  message?: Message;
  done?: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

interface OllamaModelData {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: OllamaModelDetails;
}

export interface Assistant {
  id: number;
  name: string;
  display_name: string;
  icon?: string; // Optional, as it can be null or blank
  description?: string; // Optional, as it can be null or blank
  api_key?: string; // Optional, as it can be null or blank
  default_temperature?: number;
  default_max_tokens?: number;
  created_at?: string; // ISO date string
}

export interface ModelDetails {
  parent_model?: string;
  format?: string;
  family?: string;
  families?: string[];
  parameter_size?: string;
  quantization_level?: string;
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

export interface ProviderModels {
  ollama: StandardModel[];
  openai: StandardModel[];
  anthropic: StandardModel[];
  google: StandardModel[];
}
