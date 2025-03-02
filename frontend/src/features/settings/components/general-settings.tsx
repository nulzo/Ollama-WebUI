import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/features/settings/api/get-settings';
import { useUpdateGeneralSettings } from '@/features/settings/components/update-general-settings';
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

// Define the theme type to ensure type safety
type ThemeType = 'light' | 'dark' | 'system';

const generalSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  default_model: z.string(),
  notifications_enabled: z.boolean(),
  inline_citations_enabled: z.boolean(),
});

// Type for the form values
type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;

export function GeneralSettingsSection() {
  const { data } = useSettings();
  const updateSettings = useUpdateGeneralSettings();

  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      theme: 'system' as ThemeType,
      language: 'en',
      timezone: 'UTC',
      default_model: 'gpt-4',
      notifications_enabled: true,
      inline_citations_enabled: true,
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
      
      form.reset({
        theme,
        language: general.language || 'en',
        timezone: general.timezone || 'UTC',
        default_model: general.default_model || 'gpt-4',
        notifications_enabled: general.notifications_enabled ?? true,
        inline_citations_enabled: general.inline_citations_enabled ?? true,
      });
    }
  }, [data, form]);

  const onSubmit = (values: GeneralSettingsFormValues) => {
    updateSettings.mutate(values);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Theme</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </form>
      </Form>
    </div>
  );
}