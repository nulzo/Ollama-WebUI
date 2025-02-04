import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Prompt } from './prompt';

const promptFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  command: z.string().min(2, { message: 'Command must be at least 2 characters.' }),
  description: z.string().optional(),
  content: z.string().min(1, { message: 'Prompt content is required.' }),
  tags: z.array(z.string()).optional(),
});

type PromptFormValues = z.infer<typeof promptFormSchema>;

interface PromptFormProps {
  prompt?: Prompt;
  onSubmit: (values: PromptFormValues) => void;
}

export function PromptForm({ prompt, onSubmit }: PromptFormProps) {
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: prompt?.title || '',
      command: prompt?.command || '',
      description: prompt?.description || '',
      content: prompt?.content || '',
      tags: prompt?.tags || [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter prompt title..." {...field} />
              </FormControl>
              <FormDescription>This will be the title of the prompt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="command"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Command</FormLabel>
              <FormControl>
                <Input placeholder="Enter prompt command..." {...field} />
              </FormControl>
              <FormDescription>This will be the command used to run the prompt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your prompt's purpose..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt template..."
                  className="h-32 resize-none font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>Use {'{variable}'} syntax for template variables</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">{prompt ? 'Update Prompt' : 'Create Prompt'}</Button>
        </div>
      </form>
    </Form>
  );
}
