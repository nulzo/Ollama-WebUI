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

export type Provider = 'ollama' | 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'cohere' | 'ai21' | 'huggingface' | 'together' | 'perplexity' | 'databricks' | 'nvidia' | 'microsoft' | 'qwen' | 'deepseek' | '01-ai' | 'liquid' | 'reflection' | 'gryphe' | 'neversleep' | 'cognitive' | 'nous' | 'alpindale' | 'undi95' | 'sophosympatheia' | 'openchat' | 'teknium' | 'austism' | 'jondurbin' | 'lynn' | 'mattshumer' | 'sao10k' | 'eva-unit-01' | 'infermatic' | 'koboldai' | 'thebloke' | 'pygmalionai' | 'ehartford' | 'mancer' | 'openrouter';

export interface StandardModel {
  id: string;                     // model identifier
  name: string;                   // model name
  model: string;                  // display name of the model
  description?: string;           // model description
  max_input_tokens: number;       // maximum allowed input tokens (default: 2048)
  max_output_tokens: number;      // maximum allowed output tokens (default: 2048)
  vision_enabled: boolean;        // whether the model supports vision (default: false)
  embedding_enabled: boolean;     // whether the model supports embeddings (default: false)
  tools_enabled: boolean;         // whether the model supports tools (default: false)
  provider: Provider;
  size?: number;                  // size of the model in bytes
  modified_at?: string;           // last modified date
  via_openrouter?: boolean;       // whether the model is accessed via OpenRouter
  
  // Rich metadata from OpenRouter
  context_length?: number;        // context length in tokens
  pricing?: {
    prompt: number;               // cost per prompt token
    completion: number;           // cost per completion token
    image?: number | null;        // cost per image (if supported)
  };
  architecture?: {
    modality: string;             // e.g., "text->text", "text+image->text"
    input_modalities: string[];   // e.g., ["text", "image"]
    output_modalities: string[];  // e.g., ["text"]
    tokenizer: string;            // e.g., "GPT", "Claude", "Mistral"
  };
  supported_parameters?: string[]; // supported API parameters
  is_moderated?: boolean;         // whether the model is moderated
  canonical_slug?: string;        // canonical model slug
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
  [provider: string]: StandardModel[];
}

export interface AvailableModel {
  name: string;
  description: string;
  capabilities: string[];
  sizes: string[];
  published: string;
  link: string;
  pulls: string;
  size_estimates?: Record<string, number>; // Map of size name to estimated size in bytes
}

export interface ModelDownloadStatus {
  id: string;
  model: string;
  status: string;
  progress: number;
  total_size: number;
  downloaded: number;
  error: string | null;
  elapsed_seconds: number | null;
}
