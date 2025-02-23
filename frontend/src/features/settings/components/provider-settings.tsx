import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useProviderSettings } from '@/features/settings/api/get-settings';
import { useUpdateProviderSettings } from '@/features/settings/api/update-provider-settings';
import { useCreateProviderSettings } from '@/features/settings/api/create-provider-settings';
import { PROVIDER_CONFIGS, ProviderSettings } from '@/types/provider-settings';
import { useSettingsForms } from './form-context';

//
// The schema and types for provider settings are unchanged
//
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

export const providerFormSchema = z.object({
  provider_type: z.string(),
  api_key: z.string().optional(),
  endpoint: z.string().optional(),
  organization_id: z.string().optional(),
  is_enabled: z.boolean().default(false),
});

export type ProviderFormData = z.infer<typeof providerFormSchema>;

//
// UPDATED: ProviderSettingsForm now accepts onRegister/onUnregister props.
// It registers its own submit handler with the shared form context.
//
function ProviderSettingsForm({
  providerType,
  config,
  existingSettings,
  onSubmit,
  onRegister,
  onUnregister,
}: {
  providerType: string;
  config: ProviderConfig;
  existingSettings?: ProviderSettings;
  onSubmit: (data: ProviderFormData) => Promise<void>;
  onRegister?: (submitHandler: () => Promise<void>) => void;
  onUnregister?: () => void;
}) {
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider_type: providerType,
      api_key: existingSettings?.api_key || "",
      endpoint: existingSettings?.endpoint || "",
      organization_id: existingSettings?.organization_id || "",
      is_enabled: existingSettings?.is_enabled ?? false,
    },
  });

  // Create a submission function to register with the parent
  useEffect(() => {
    const submitForm = async () => {
      await form.handleSubmit(onSubmit)();
    };

    if (onRegister) {
      onRegister(submitForm);
    }
    return () => {
      if (onUnregister) {
        onUnregister();
      }
    };
  }, [form, onSubmit, onRegister, onUnregister]);

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
                        disabled={!form.watch("is_enabled")}
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
  const { registerForm, unregisterForm } = useSettingsForms();
  const submissionsRef = useRef<{ [key: string]: () => Promise<void> }>({});

  // Wrap the submission call for one provider so that we can process it.
  const handleSubmit = async (providerType: string, data: ProviderFormData) => {
    try {
      const existingSettings = Array.isArray(settings)
        ? settings.find((s: ProviderSettings) => s.provider_type === providerType)
        : undefined;

      if (existingSettings?.id) {
        console.log(`Updating settings for ${providerType}`, data);
        await updateSetting.mutateAsync({
          providerId: existingSettings.id.toString(),
          data: { ...data, provider_type: providerType },
        });
      } else {
        console.log(`Creating settings for ${providerType}`, data);
        await createSetting.mutateAsync({
          data: { ...data, provider_type: providerType },
        });
      }
    } catch (error) {
      console.error('Failed to update provider settings:', error);
    }
  };

  // Stable composite submission handler for all provider forms.
  const submitAllProviders = useCallback(async () => {
    const registered = Object.keys(submissionsRef.current);
    console.log("Submitting provider forms for:", registered);
    await Promise.all(
      Object.values(submissionsRef.current).map((fn) => fn())
    );
  }, []);

  // Register the composite submission handler under the "providers" key.
  useEffect(() => {
    registerForm("providers", submitAllProviders);
    return () => {
      unregisterForm("providers");
    };
  }, [registerForm, unregisterForm, submitAllProviders]);

  console.log(settings);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : !settings ? (
        <div>No settings found</div>
      ) : (
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            {Object.entries(PROVIDER_CONFIGS).map(([providerType, config]) => {
              const providerSettings = settings.data
                ? settings.data.find(
                    (s: ProviderSettings) => s.provider_type === providerType
                  )
                : undefined;

              return (
                <ProviderSettingsForm
                  key={providerType}
                  providerType={providerType}
                  config={config}
                  existingSettings={providerSettings}
                  onSubmit={(data) => handleSubmit(providerType, data)}
                  onRegister={(submitHandler) => {
                    submissionsRef.current[providerType] = submitHandler;
                  }}
                  onUnregister={() => {
                    delete submissionsRef.current[providerType];
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}