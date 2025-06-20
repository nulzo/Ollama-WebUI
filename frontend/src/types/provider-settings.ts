export interface ProviderSettings {
  id?: number;
  provider_type: string;
  api_key?: string;
  endpoint?: string;
  organization_id?: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderField {
  name: string;
  type: 'text' | 'password' | 'url';
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface ProviderConfig {
  name: string;
  fields: ProviderField[];
}

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  ollama: {
    name: 'Ollama',
    fields: [
      {
        name: 'endpoint',
        type: 'url',
        label: 'Endpoint',
        placeholder: 'http://localhost:11434',
        required: true,
      },
    ],
  },
  openai: {
    name: 'OpenAI',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        required: true,
      },
      {
        name: 'organization_id',
        type: 'text',
        label: 'Organization ID',
      },
    ],
  },
  google: {
    name: 'Google',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        required: true,
      },
    ],
  },
  anthropic: {
    name: 'Anthropic',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        required: true,
      },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        required: true,
      },
    ],
  },
};