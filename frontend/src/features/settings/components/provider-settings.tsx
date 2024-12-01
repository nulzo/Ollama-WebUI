import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useProviderSettings } from '../api/get-provider-settings';
import { useUpdateProviderSetting } from '../api/update-provider-settings';
import { useCreateProviderSetting } from '../api/create-provider-settings';
import { toast } from '@/components/ui/use-toast';

// Define the providers configuration
const providers = {
  ollama: {
    name: 'Ollama',
    fields: [
      {
        name: 'endpoint',
        label: 'Endpoint',
        type: 'text',
        placeholder: 'Enter endpoint URL',
        required: true,
        defaultValue: 'http://localhost:11434',
      },
    ],
    modelOptions: ['llama2', 'mistral', 'codellama'],
  },
  openai: {
    name: 'OpenAI',
    fields: [
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter API key',
        required: true,
      },
      {
        name: 'organization_id',
        label: 'Organization ID (Optional)',
        type: 'text',
        placeholder: 'Enter organization ID',
        required: false,
      },
    ],
    modelOptions: ['gpt-4', 'gpt-3.5-turbo'],
  },
  // ... similar structure for azure and anthropic ...
};

export const ProviderSettings = () => {
  const { data: settings, isLoading } = useProviderSettings();
  const updateSetting = useUpdateProviderSetting();
  const createSetting = useCreateProviderSetting();
  const [formData, setFormData] = useState<Record<string, any>>({});

  if (isLoading) return <div>Loading...</div>;

  const handleSubmit = async (providerType: string) => {
    try {
      const existingSettings = settings?.find(s => s.provider_type === providerType);
      const data = {
        ...formData[providerType],
        provider_type: providerType,
      };

      if (existingSettings?.id) {
        await updateSetting.mutateAsync({
          providerId: existingSettings.id.toString(),
          data: {
            ...existingSettings,
            ...data,
          },
        });
      } else {
        await createSetting.mutateAsync({ data });
      }

      toast({
        title: 'Settings updated',
        description: `${providers[providerType].name} settings have been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(providers).map(([providerType, config]) => {
        const providerSettings = settings?.find(s => s.provider_type === providerType);

        return (
          <Card key={providerType}>
            <CardHeader>
              <CardTitle>{config.name} Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSubmit(providerType);
                }}
                className="space-y-4"
              >
                {config.fields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={`${providerType}-${field.name}`}>{field.label}</Label>
                    <Input
                      id={`${providerType}-${field.name}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      defaultValue={providerSettings?.[field.name] || field.defaultValue || ''}
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          [providerType]: {
                            ...prev[providerType],
                            [field.name]: e.target.value,
                          },
                        }));
                      }}
                      required={field.required}
                    />
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <Label>Enable Provider</Label>
                  <Switch
                    defaultChecked={providerSettings?.is_enabled}
                    onCheckedChange={checked => {
                      setFormData(prev => ({
                        ...prev,
                        [providerType]: {
                          ...prev[providerType],
                          is_enabled: checked,
                        },
                      }));
                    }}
                  />
                </div>

                <Button type="submit" disabled={updateSetting.isPending || createSetting.isPending}>
                  {updateSetting.isPending || createSetting.isPending
                    ? 'Saving...'
                    : `Save ${config.name} Settings`}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
