import { useProviderSettings } from '@/features/settings/api/get-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useUpdateProviderSettings } from '@/features/settings/api/update-provider-settings';
import { useCreateProviderSettings } from '@/features/settings/api/create-provider-settings';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';

export interface ProviderField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number';
  placeholder: string;
  required?: boolean | undefined | null;
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
        required: true,  // Add required field
      },
      {
        name: 'organization_id',
        label: 'Organization ID',
        type: 'text',
        placeholder: 'Enter your organization ID (optional)',
        required: false,  // Optional field
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
        required: true,
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
        required: true,
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

const providerFormSchema = z.object({
  provider_type: z.string(),
  api_key: z.string().optional(),
  host: z.string().optional(),  // Change endpoint to host
  organization_id: z.string().optional(),
  is_enabled: z.boolean().default(false),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

// Separate component for each provider's form
function ProviderSettingsForm({
  providerType,
  config,
  existingSettings,
  onSubmit,
}: {
  providerType: string;
  config: ProviderConfig;
  existingSettings?: ProviderSettings;
  onSubmit: (data: ProviderFormData) => Promise<void>;
}) {
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider_type: providerType,
      api_key: existingSettings?.api_key || "",
      host: existingSettings?.host || "",
      organization_id: existingSettings?.organization_id || "",
      is_enabled: existingSettings?.is_enabled || false,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {config.fields.map(field => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof ProviderFormData}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formField.value as string}
                        onChange={formField.onChange}
                        onBlur={formField.onBlur}
                        name={formField.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center">
                  <FormLabel>Enable Provider</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ProviderSettingsSection() {
  const { data: settings, isLoading } = useProviderSettings();
  const updateSetting = useUpdateProviderSettings();
  const createSetting = useCreateProviderSettings();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (providerType: string, data: ProviderFormData) => {
    try {
      const existingSettings = Array.isArray(settings) ? 
        settings.find(s => s.provider_type === providerType) : 
        undefined;

      if (existingSettings?.id) {
        await updateSetting.mutateAsync({
          providerId: existingSettings.id.toString(),
          data,
        });
      } else {
        await createSetting.mutateAsync({
          data,
        });
      }
    } catch (error) {
      console.error('Failed to update provider settings:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        {Object.entries(PROVIDER_CONFIGS).map(([providerType, config]) => {
          const providerSettings = Array.isArray(settings) ? 
            settings.find(s => s.provider_type === providerType) : 
            undefined;

          return (
            <ProviderSettingsForm
              key={providerType}
              providerType={providerType}
              config={config}
              existingSettings={providerSettings}
              onSubmit={(data) => handleSubmit(providerType, data)}
            />
          );
        })}
      </div>
    </div>
  );
}