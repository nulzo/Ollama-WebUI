import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/features/settings/api/get-settings';
import { useUpdatePrivacySettings } from '@/features/settings/components/update-privacy-settings';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const privacySettingsSchema = z.object({
  data_collection: z.boolean(),
  error_reporting: z.boolean(),
  chat_history_retention: z.enum(['1month', '3months', '6months', '1year', 'forever']),
  export_format: z.enum(['json', 'csv', 'txt']),
  custom_privacy_notice: z.string().optional(),
});

export function PrivacySettingsSection() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdatePrivacySettings();

  const form = useForm({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: settings?.privacy || {
      data_collection: false,
      error_reporting: false,
      chat_history_retention: '6months',
      export_format: 'json',
      custom_privacy_notice: '',
    },
  });

  const onSubmit = (values: z.infer<typeof privacySettingsSchema>) => {
    updateSettings.mutate(values);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="data_collection"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <FormLabel>Data Collection</FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Allow anonymous usage data collection
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
            name="chat_history_retention"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chat History Retention</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1month">1 Month</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="custom_privacy_notice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Privacy Notice</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter any specific privacy requirements..."
                    className="resize-none"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}