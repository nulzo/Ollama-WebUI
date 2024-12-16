export interface ProviderSettings {
  id?: number;
  provider_type: string;
  api_key?: string;
  endpoint?: string;
  organization_id?: string;
  is_enabled: boolean;
  default_model?: string;
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
  modelOptions: string[];
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
    modelOptions: ['llama2', 'mistral', 'codellama'],
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
    modelOptions: ['gpt-4', 'gpt-3.5-turbo'],
  },
  azure: {
    name: 'Azure OpenAI',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        required: true,
      },
      {
        name: 'endpoint',
        type: 'url',
        label: 'Endpoint',
        required: true,
      },
    ],
    modelOptions: ['gpt-4', 'gpt-35-turbo'],
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
    modelOptions: ['claude-3-opus', 'claude-3-sonnet'],
  },
};

export interface UserSettings {
  theme: string;
  default_provider: string;
  providers: ProviderSettings[];
}
