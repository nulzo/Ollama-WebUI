import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/features/settings/api/get-settings';
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
import { Download } from 'lucide-react';

const exportSettingsSchema = z.object({
  include_chat_history: z.boolean(),
  include_settings: z.boolean(),
  include_profile: z.boolean(),
  export_format: z.enum(['json', 'csv', 'txt']),
  date_range: z.enum(['all', '1month', '3months', '6months', '1year']),
});

export function ExportSettingsSection() {
  const { data: settings } = useSettings();

  const form = useForm({
    resolver: zodResolver(exportSettingsSchema),
    defaultValues: settings?.export || {
      include_chat_history: true,
      include_settings: true,
      include_profile: true,
      export_format: 'json',
      date_range: 'all',
    },
  });

  const onSubmit = (values: z.infer<typeof exportSettingsSchema>) => {
    // Implement export functionality
    console.log('Export settings:', values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-medium text-lg">Export Data</h2>
        <p className="text-muted-foreground text-sm">
          Export your data in various formats
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="include_chat_history"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <FormLabel>Include Chat History</FormLabel>
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
            name="export_format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Export Format</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit">
              <Download className="mr-2 w-4 h-4" />
              Export Data
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}