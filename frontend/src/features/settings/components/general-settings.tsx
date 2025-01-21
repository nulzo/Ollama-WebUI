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

const generalSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  default_model: z.string(),
  notifications_enabled: z.boolean(),
});

export function GeneralSettingsSection() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateGeneralSettings();

  const form = useForm({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      theme: settings?.general?.theme || 'system',
      language: settings?.general?.language || 'en',
      timezone: settings?.general?.timezone || 'UTC',
      default_model: settings?.general?.default_model || 'gpt-4',
      notifications_enabled: settings?.general?.notifications_enabled ?? true,
    },
  });

  const onSubmit = (values: z.infer<typeof generalSettingsSchema>) => {
    updateSettings.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-medium text-lg">General Settings</h2>
        <p className="text-muted-foreground text-sm">
          Customize your application preferences
        </p>
      </div>

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
        </form>
      </Form>
    </div>
  );
}