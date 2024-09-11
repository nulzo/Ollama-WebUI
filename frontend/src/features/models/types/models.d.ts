import { Message } from '@/types/providers/ollama';

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