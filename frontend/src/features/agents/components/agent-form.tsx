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
import { Agent } from '../types/agent';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ModelSelect } from '@/features/models/components/model-select';
import { ImagePlus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useRef } from 'react';

const agentFormSchema = z.object({
  icon: z.string().optional().nullable(),
  display_name: z.string().min(2, { message: 'Display name must be at least 2 characters.' }),
  description: z.string().optional(),
  model: z.string().min(1, { message: 'Please select a model.' }),
  system_prompt: z.string().optional(),
  enabled: z.boolean().default(true),
  files: z.boolean().default(false),
  function_call: z.boolean().default(false),
  vision: z.boolean().default(false),
  max_output: z.number().min(1).max(32768),
  tokens: z.number().min(1).max(32768),
  num_ctx: z.number().min(512).max(32768),
  low_vram: z.boolean().default(false),
  embedding_only: z.boolean().default(false),
  seed: z.number().min(0),
  num_predict: z.number().min(1).max(32768),
  temperature: z.number().min(0).max(2),
  top_k: z.number().min(0).max(100),
  top_p: z.number().min(0).max(1),
  tfs_z: z.number().min(0).max(2),
  typical_p: z.number().min(0).max(1),
  repeat_last_n: z.number().min(0).max(32768),
  repeat_penalty: z.number().min(0).max(2),
  presence_penalty: z.number().min(-2).max(2),
  frequency_penalty: z.number().min(-2).max(2),
  penalize_newline: z.boolean().default(false),
  stop: z.array(z.string()).default([]),
});

const ImageUpload = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          {value ? (
            <AvatarImage src={value} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-primary/10">
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="-right-2 -bottom-2 absolute flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shadow-lg rounded-full w-8 h-8"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="w-4 h-4" />
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shadow-lg rounded-full w-8 h-8"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export function AgentForm({
  agent,
  onSubmit,
}: {
  agent: Agent | null;
  onSubmit: (values: z.infer<typeof agentFormSchema>) => void;
}) {
  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      icon: agent?.icon,
      display_name: agent?.display_name || '',
      description: agent?.description || '',
      model: agent?.model || '',
      system_prompt: agent?.system_prompt || '',
      enabled: agent?.enabled ?? true,
      files: agent?.files ?? false,
      function_call: agent?.function_call ?? false,
      vision: agent?.vision ?? false,
      max_output: agent?.max_output ?? 2048,
      tokens: agent?.tokens ?? 2048,
      num_ctx: agent?.num_ctx ?? 4096,
      low_vram: agent?.low_vram ?? false,
      embedding_only: agent?.embedding_only ?? false,
      seed: agent?.seed ?? 0,
      num_predict: agent?.num_predict ?? 128,
      temperature: agent?.temperature ?? 0.8,
      top_k: agent?.top_k ?? 40,
      top_p: agent?.top_p ?? 0.95,
      tfs_z: agent?.tfs_z ?? 1,
      typical_p: agent?.typical_p ?? 1,
      repeat_last_n: agent?.repeat_last_n ?? 64,
      repeat_penalty: agent?.repeat_penalty ?? 1.1,
      presence_penalty: agent?.presence_penalty ?? 0,
      frequency_penalty: agent?.frequency_penalty ?? 0,
      penalize_newline: agent?.penalize_newline ?? false,
      stop: agent?.stop ?? [],
    },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        icon: agent.icon,
        display_name: agent.display_name,
        description: agent.description,
        model: agent.model,
        system_prompt: agent.system_prompt,
        enabled: agent.enabled,
        files: agent.files,
        function_call: agent.function_call,
        vision: agent.vision,
        max_output: agent.max_output,
        tokens: agent.tokens,
        num_ctx: agent.num_ctx,
        low_vram: agent.low_vram,
        embedding_only: agent.embedding_only,
        seed: agent.seed,
        num_predict: agent.num_predict,
        temperature: agent.temperature,
        top_k: agent.top_k,
        top_p: agent.top_p,
        tfs_z: agent.tfs_z,
        typical_p: agent.typical_p,
        repeat_last_n: agent.repeat_last_n,
        repeat_penalty: agent.repeat_penalty,
        presence_penalty: agent.presence_penalty,
        frequency_penalty: agent.frequency_penalty,
        penalize_newline: agent.penalize_newline,
        stop: agent.stop,
      });
    }
  }, [agent, form.reset]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Basic Information</h3>

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Custom Agent" {...field} />
                </FormControl>
                <FormDescription>The name that will be displayed for this agent.</FormDescription>
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
                    placeholder="Describe your agent's purpose..."
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
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Model</FormLabel>
                <FormControl>
                  <ModelSelect value={field.value} onValueChange={field.onChange} className="border" />
                </FormControl>
                <FormDescription>Select the base model for this agent.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="system_prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter system prompt..."
                    className="h-32 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Define the agent's behavior and context.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Capabilities Section */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Capabilities</h3>

          <div className="gap-4 grid grid-cols-2">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Enabled</FormLabel>
                    <FormDescription>Enable or disable this agent.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>File Handling</FormLabel>
                    <FormDescription>Allow file uploads</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="function_call"
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Function Calling</FormLabel>
                    <FormDescription>Enable function calls</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Vision</FormLabel>
                    <FormDescription>Enable image processing</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Basic Parameters Section */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Basic Parameters</h3>

          <FormField
            control={form.control}
            name="max_output"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Output Tokens</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Maximum number of tokens in the response.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tokens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Context Tokens</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Number of tokens to consider for context.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Advanced Parameters Section */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Advanced Parameters</h3>

          <div className="gap-4 grid grid-cols-2">
            <FormField
              control={form.control}
              name="low_vram"
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Low VRAM Mode</FormLabel>
                    <FormDescription>Optimize for low memory</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embedding_only"
              render={({ field }) => (
                <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <FormLabel>Embedding Only</FormLabel>
                    <FormDescription>Use only for embeddings</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="seed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seed</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Random seed for reproducibility (0 for random).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="num_predict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Predictions</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Generation Parameters Section */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Generation Parameters</h3>

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temperature</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-muted-foreground text-sm">{field.value}</span>
                  </div>
                </FormControl>
                <FormDescription>Controls randomness in the output.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="top_p"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top P</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-muted-foreground text-sm">{field.value}</span>
                  </div>
                </FormControl>
                <FormDescription>Nucleus sampling threshold.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="top_k"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top K</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-muted-foreground text-sm">{field.value}</span>
                  </div>
                </FormControl>
                <FormDescription>Limits the cumulative probability mass.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repeat_penalty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Penalty</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-muted-foreground text-sm">{field.value}</span>
                  </div>
                </FormControl>
                <FormDescription>Penalizes repetition in generated text.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="presence_penalty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Presence Penalty</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={-2}
                      max={2}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-muted-foreground text-sm">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency_penalty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency Penalty</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={-2}
                      max={2}
                      step={0.1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="flex-1"
                    />
                    <span className="w-12 text-muted-foreground text-sm">{field.value}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="penalize_newline"
            render={({ field }) => (
              <FormItem className="flex flex-row justify-between items-center p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <FormLabel>Penalize Newlines</FormLabel>
                  <FormDescription>Apply penalty to newline tokens</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">{agent ? 'Update Agent' : 'Create Agent'}</Button>
        </div>
      </form>
    </Form>
  );
}
