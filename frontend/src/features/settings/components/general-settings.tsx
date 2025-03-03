import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/features/settings/api/get-settings';
import { useUpdateGeneralSettings } from '@/features/settings/components/update-general-settings';
import { useModels } from '@/features/models/api/get-models';
import { PromptSettings } from '@/features/settings/types/settings';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useSettingsForms } from './form-context';

// Define the theme type to ensure type safety
type ThemeType = 'light' | 'dark' | 'system';

const generalSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  default_model: z.string(),
  notifications_enabled: z.boolean(),
  inline_citations_enabled: z.boolean(),
  use_llm_generated_prompts: z.boolean().default(false),
  prompt_generation_model: z.string().optional(),
});

// Type for the form values
type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export function GeneralSettingsSection() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateGeneralSettings();
  const { data: modelsData } = useModels();
  const { registerForm, unregisterForm } = useSettingsForms();

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      theme: 'system' as ThemeType,
      language: 'en',
      timezone: 'UTC',
      default_model: 'gpt-4',
      notifications_enabled: true,
      inline_citations_enabled: true,
      use_llm_generated_prompts: false,
      prompt_generation_model: 'llama3.2:3b',
    },
  });

  // Update form values when settings data is loaded
  useEffect(() => {
    if (data?.settings?.general) {
      const general = data.settings.general;
      
      // Ensure theme is one of the allowed values
      let theme: ThemeType = 'system';
      if (general.theme === 'light' || general.theme === 'dark' || general.theme === 'system') {
        theme = general.theme;
      }
      
      // Get prompt settings from the data
      const promptSettings = (data.settings.prompt_settings || { use_llm_generated: false, model: 'llama3.2:3b' }) as PromptSettings;
      
      console.log('Loading settings:', {
        general,
        promptSettings
      });
      
      form.reset({
        theme,
        language: general.language || 'en',
        timezone: general.timezone || 'UTC',
        default_model: general.default_model || 'gpt-4',
        notifications_enabled: general.notifications_enabled ?? true,
        inline_citations_enabled: general.inline_citations_enabled ?? true,
        use_llm_generated_prompts: promptSettings.use_llm_generated ?? false,
        prompt_generation_model: promptSettings.model || 'llama3.2:3b',
      });
    }
  }, [data, form]);

  const onSubmit = async (values: GeneralSettingsFormValues) => {
    const { use_llm_generated_prompts, prompt_generation_model, ...generalSettings } = values;
    
    const updatedValues = {
      general: generalSettings,
      prompt_settings: {
        use_llm_generated: use_llm_generated_prompts,
        model: prompt_generation_model || 'llama3.2:3b',
      }
    };
    
    console.log('Submitting settings:', updatedValues);
    await updateSettings.mutateAsync(updatedValues);
  };

  // Register the form with the form context
  useEffect(() => {
    registerForm('general', form.handleSubmit(onSubmit));
    return () => unregisterForm('general');
  }, [registerForm, unregisterForm, form, onSubmit]);

  if (isLoading) {
    return <div className="py-4 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notifications_enabled"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <FormLabel>Notifications</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Receive notifications about updates and messages
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inline_citations_enabled"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <FormLabel>Inline Citations</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Show citations inline within the text instead of only at the bottom
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="use_llm_generated_prompts"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <FormLabel>LLM-Generated Prompts</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Use AI to dynamically generate conversation prompts
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch('use_llm_generated_prompts') && (
            <FormField
              control={form.control}
              name="prompt_generation_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Generation Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelsData?.ollama?.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Form>
    </div>
  );
}