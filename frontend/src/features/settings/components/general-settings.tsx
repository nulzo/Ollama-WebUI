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
  FormDescription,
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
import { ModelSelect } from '@/features/models/components/model-select';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { StandardModel } from '@/features/models/types/models';
import { useQueryClient } from '@tanstack/react-query';

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

// A lightweight version of ModelSelect optimized for performance
function ModelSelectLite({ value, onValueChange, className }: { 
  value?: string; 
  onValueChange: (value: string) => void; 
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: modelsData, isLoading } = useModels();

  // Debug the value prop
  console.log('ModelSelectLite value prop:', value);

  const formattedModels: StandardModel[] = useMemo(() => {
    if (!modelsData) return [];
    return Object.values(modelsData).flat();
  }, [modelsData]);

  const filteredModels = useMemo(() => {
    if (!search) return formattedModels;
    return formattedModels.filter(model =>
      model.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [formattedModels, search]);

  // Group models by provider
  const groupedModels = useMemo(() => {
    return filteredModels.reduce((groups, model) => {
      if (!groups[model.provider]) {
        groups[model.provider] = [];
      }
      groups[model.provider].push(model);
      return groups;
    }, {} as Record<string, StandardModel[]>);
  }, [filteredModels]);

  // Find the selected model
  const selectedModel = useMemo(() => {
    if (!value) return null;
    
    // Try to find the model in the formatted models list
    const model = formattedModels.find(model => model.id === value);
    if (model) return model;
    
    // If not found, it might be a custom model ID (like from Ollama)
    // Create a temporary model object for display
    return {
      id: value,
      name: value.split(':')[0], // Extract name from ID (e.g., "small_cringe" from "small_cringe:latest-...")
      model: value,
      provider: value.includes(':') ? 'ollama' : 'unknown',
      max_input_tokens: 2048,
      max_output_tokens: 2048,
      vision_enabled: false,
      embedding_enabled: false,
      tools_enabled: false,
    };
  }, [formattedModels, value]);

  // Debug the selected model
  console.log('Selected model:', selectedModel);

  if (isLoading) {
    return (
      <Button variant="ghost" className="justify-start w-full font-normal text-left" disabled>
        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        <span>Loading models...</span>
      </Button>
    );
  }

  if (!formattedModels.length) {
    return (
      <Button variant="ghost" className="justify-start w-full font-normal text-left" disabled>
        <span>No models available</span>
      </Button>
    );
  }

  const capitalize = (s: string) => s?.charAt(0)?.toUpperCase() + s?.slice(1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between w-full', className)}
        >
          <div className="flex items-center truncate">
            <span className="truncate">
              {selectedModel ? selectedModel.name : (value || 'Select model...')}
            </span>
          </div>
          <ChevronsUpDown className="opacity-50 ml-2 size-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]" align="start">
        <Command shouldFilter={false} className="max-h-[400px]">
          <CommandInput placeholder="Search models..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <ScrollArea className="h-[300px]">
              {Object.entries(groupedModels).map(([provider, models]) => (
                <CommandGroup key={provider} heading={`${capitalize(provider)} Models`}>
                  {models.map(model => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      className="relative flex items-center h-8 text-sm"
                      onSelect={currentValue => {
                        console.log('Model selected:', currentValue, model);
                        onValueChange(currentValue);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <div className="flex items-center w-full min-w-0">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            value === model.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <Badge variant="outline" className="mr-2 shrink-0">
                          {capitalize(model.provider)}
                        </Badge>
                        <span className="min-w-0 truncate">{model.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function GeneralSettingsSection() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateGeneralSettings();
  const { data: modelsData } = useModels();
  const { registerForm, unregisterForm } = useSettingsForms();
  const queryClient = useQueryClient();

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
      
      // Debug the prompt settings
      console.log('Loading settings from API:', {
        general,
        promptSettings
      });
      
      // Debug the model value
      console.log('Model from settings:', promptSettings.model);
      
      // Reset the form with the values from the API
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
      
      // Debug the form values after reset
      console.log('Form values after reset:', form.getValues());
    }
  }, [data, form]);

  const onSubmit = async (values: GeneralSettingsFormValues) => {
    const { use_llm_generated_prompts, prompt_generation_model, ...generalSettings } = values;
    
    // Log the selected model for debugging
    console.log('Selected model for prompts:', prompt_generation_model);
    console.log('LLM-generated prompts enabled:', use_llm_generated_prompts, typeof use_llm_generated_prompts);
    
    // Ensure we have a valid model value
    if (!prompt_generation_model && use_llm_generated_prompts) {
      console.warn('No model selected but LLM-generated prompts are enabled. Using default model.');
    }
    
    // Get the actual model value to use
    const modelToUse = prompt_generation_model || 'llama3.2:3b';
    console.log('Model to use:', modelToUse);
    
    // Ensure use_llm_generated is explicitly a boolean
    const useLlmGenerated = Boolean(use_llm_generated_prompts);
    
    const updatedValues = {
      general: generalSettings,
      prompt_settings: {
        use_llm_generated: useLlmGenerated,
        model: modelToUse,
      }
    };
    
    console.log('Submitting settings:', JSON.stringify(updatedValues, null, 2));
    await updateSettings.mutateAsync(updatedValues);
    
    // Force refetch of settings and invalidate prompts cache
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    queryClient.invalidateQueries({ queryKey: ['prompts'] });
  };

  // Register the form with the form context
  useEffect(() => {
    registerForm('general', form.handleSubmit(onSubmit));
    return () => unregisterForm('general');
  }, [registerForm, unregisterForm, form, onSubmit]);

  // Log form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'prompt_generation_model' || name === 'use_llm_generated_prompts') {
        console.log(`Form field "${name}" changed:`, value[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
                  <FormControl>
                    <ModelSelectLite
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Select the model to use for generating conversation prompts
                  </FormDescription>
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