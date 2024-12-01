import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface ProviderSettingsProps {
  selectedProvider: string | null;
  providerSettings: any; // Replace with proper type from your API
}

const providers = {
  ollama: {
    name: 'Ollama',
    settings: {
      endpoint: 'http://localhost:11434',
      modelOptions: ['llama2', 'mistral', 'codellama'],
    },
  },
  openai: {
    name: 'OpenAI',
    settings: {
      apiKey: '',
      organizationId: '',
      modelOptions: ['gpt-4', 'gpt-3.5-turbo'],
    },
  },
  azure: {
    name: 'Azure AI',
    settings: {
      apiKey: '',
      endpoint: '',
      modelOptions: ['gpt-4', 'gpt-35-turbo'],
    },
  },
  anthropic: {
    name: 'Anthropic',
    settings: {
      apiKey: '',
      modelOptions: ['claude-3-opus', 'claude-3-sonnet'],
    },
  },
};

export const ProviderSettings = ({ selectedProvider, providerSettings }: ProviderSettingsProps) => {
  if (!selectedProvider) {
    return <div>Please select a provider</div>;
  }

  const provider = providers[selectedProvider as keyof typeof providers];
  const currentSettings = providerSettings?.find((p: any) => p.provider_type === selectedProvider);

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">{provider.name} Settings</h2>

      {selectedProvider === 'ollama' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Endpoint</Label>
            <Input placeholder="Enter endpoint URL" defaultValue={currentSettings?.endpoint} />
          </div>
        </div>
      )}

      {(selectedProvider === 'openai' || selectedProvider === 'anthropic') && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Enter API key"
              defaultValue={currentSettings?.api_key}
            />
          </div>
          {selectedProvider === 'openai' && (
            <div className="space-y-1">
              <Label>Organization ID (Optional)</Label>
              <Input
                placeholder="Enter organization ID"
                defaultValue={currentSettings?.organization_id}
              />
            </div>
          )}
        </div>
      )}

      {selectedProvider === 'azure' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Enter API key"
              defaultValue={currentSettings?.api_key}
            />
          </div>
          <div className="space-y-1">
            <Label>Endpoint</Label>
            <Input placeholder="Enter endpoint URL" defaultValue={currentSettings?.endpoint} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Label>Enable Provider</Label>
        <Switch defaultChecked={currentSettings?.is_enabled} />
      </div>
    </div>
  );
};
