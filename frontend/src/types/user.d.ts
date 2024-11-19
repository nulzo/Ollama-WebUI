import { Settings } from '@/types/settings';

export interface User {
  id?: number;
  color?: string;
  is_admin?: boolean;
  avatar?: string;
  email?: string;
  first_name?: string;
  full_name?: string;
  last_name?: string;
  username?: string;
  is_onboarded?: string;
  settings?: Settings;
  has_conversation?: boolean;
  theme?: string;
  settings?: {
    default_ollama_model: string;
    default_ollama_port: number;
    default_ollama_url: string;
    openai_api_key: string;
    default_open_ai_model: string;
    default_open_ai_temperature: number;
    default_open_ai_max_tokens: number;
    theme: 'light' | 'dark' | 'system';
  };
}
