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

// frontend/src/features/settings/types/settings.d.ts

export interface ProviderField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
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
  google: {
    name: 'Google AI',
    fields: [
      {
        name: 'api_key',
        type: 'password',
        label: 'API Key',
        required: true,
      },
    ],
    // Example model options. Adjust these options based on your backend's supported models.
    modelOptions: ['gemini-1', 'gemini-1.5', 'gemini-2', 'gemini-2.0-chat'],
  },
};

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  default_model: string;
  notifications_enabled: boolean;
  inline_citations_enabled: boolean;
}

export interface PromptSettings {
  use_llm_generated: boolean;
  model?: string;
}

export interface PrivacySettings {
  data_collection: boolean;
  error_reporting: boolean;
  chat_history_retention: '1month' | '3months' | '6months' | '1year' | 'forever';
  export_format: 'json' | 'csv' | 'txt';
  custom_privacy_notice?: string;
}

export interface ExportSettings {
  include_chat_history: boolean;
  include_settings: boolean;
  include_profile: boolean;
  export_format: 'json' | 'csv' | 'txt';
  date_range?: 'all' | '1month' | '3months' | '6months' | '1year';
}

export interface UserSettings {
  theme: string;
  default_provider: string;
  providers: ProviderSettings[];
  general: GeneralSettings;
  privacy: PrivacySettings;
  export: ExportSettings;
  prompt_settings?: PromptSettings;
}