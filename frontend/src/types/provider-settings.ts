export interface ProviderSettings {
  id?: number;
  provider_type: string;
  api_key?: string;
  endpoint?: string;
  organization_id?: string;
  is_enabled: boolean;
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
        type: 'text',
        label: 'Host',
        placeholder: 'http://localhost',
        required: true,
      },
      {
        name: 'api_key',
        type: 'text',
        label: 'Port',
        placeholder: '11434',
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
};
