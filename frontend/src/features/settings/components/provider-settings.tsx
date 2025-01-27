import { useProviderSettings } from '@/features/settings/api/get-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUpdateProviderSetting } from '@/features/settings/api/update-provider-settings';
import { useCreateProviderSetting } from '@/features/settings/api/create-provider-settings';
import { useForm } from 'react-hook-form';
export interface ProviderField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number';
  placeholder: string;
}

export interface ProviderConfig {
  name: string;
  fields: ProviderField[];
}

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter your OpenAI API key',
      },
      {
        name: 'organization_id',
        label: 'Organization ID',
        type: 'text',
        placeholder: 'Enter your organization ID (optional)',
      },
    ],
  },
  anthropic: {
    name: 'Anthropic',
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter your Anthropic API key',
      },
    ],
  },
  ollama: {
    name: 'Ollama',
    fields: [
      {
        name: 'host',
        label: 'Host',
        type: 'text',
        placeholder: 'Enter Ollama host URL',
      },
    ],
  },
};

export interface ProviderSettings {
  id?: number;
  provider_type: string;
  api_key?: string;
  organization_id?: string;
  host?: string;
  is_enabled: boolean;
  [key: string]: any;
}
export function ProviderSettingsSection() {
  const { data: settings, isLoading } = useProviderSettings();
  const updateSetting = useUpdateProviderSetting();
  const createSetting = useCreateProviderSetting();
  console.log("Settings", settings);

  const handleProviderUpdate = async (
    providerType: string,
    field: string,
    value: string | boolean
  ) => {
    // Find existing settings for this provider
    console.log("Settings", settings);
    const providerSettings = Array.isArray(settings) ? 
      settings.find(s => s.provider_type === providerType) : 
      undefined;

    const data = {
      [field]: value,
      provider_type: providerType,
    };

    try {
      if (providerSettings?.id) {
        await updateSetting.mutateAsync({
          providerId: providerSettings.id.toString(),
          data,
        });
      } else {
        await createSetting.mutateAsync({
          data: {
            ...data,
            is_enabled: field === 'is_enabled' ? value : false,
          }
        });
      }
    } catch (error) {
      console.error('Failed to update provider settings:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col space-y-6">

      <div className="flex flex-col space-y-4">
        {Object.entries(PROVIDER_CONFIGS).map(([providerType, config]) => {
          const providerSettings = Array.isArray(settings) ? 
            settings.find(s => s.provider_type === providerType) : 
            undefined;

          return (
            <Card key={providerType}>
              <CardHeader>
                <CardTitle>{config.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.fields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      defaultValue={providerSettings?.[field.name] || ''}
                      onChange={(e) => 
                        handleProviderUpdate(providerType, field.name, e.target.value)
                      }
                    />
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <Label>Enable Provider</Label>
                  <Switch
                    checked={providerSettings?.is_enabled || false}
                    onCheckedChange={(checked) => 
                      handleProviderUpdate(providerType, 'is_enabled', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}