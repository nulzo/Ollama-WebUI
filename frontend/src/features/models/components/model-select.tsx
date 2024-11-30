import { useCallback, useMemo, useState } from 'react';
import { useModelStore } from '../store/model-store';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { OllamaModel } from '@/types/models';
import { useModels } from '@/features/models/api/get-models.ts';
import { useOpenAiModels } from '@/features/models/api/get-openai-models.ts';
import { OllamaModelData } from '@/features/models/types/models';
import { Heart } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAssistants } from '@/features/assistant/hooks/use-assistant';
import { Assistant } from '@/features/assistant/types/assistant';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgents } from '@/features/agents/api/get-agents';

export const ModelSelect = () => {
  const [open, setOpen] = useState(false);
  const ollamaModels = useModels({});
  const openaiModels = useOpenAiModels({});
  const { data: agents } = useAgents();
  const { assistants, isLoading: isLoadingAssistants } = useAssistants();

  const { setModel, model } = useModelStore(state => ({
    setModel: state.setModel,
    model: state.model,
  }));

  const handleModelSelect = useCallback((selectedModel: OllamaModel | Assistant | Agent) => {
    // If it's an agent, we need to wrap it to match the OllamaModel interface
    if ('system_prompt' in selectedModel) {
      setModel({
        name: selectedModel.model, // Use model name instead of display_name
        model: selectedModel.model,   // Include the agent's configuration
        config: {
          temperature: selectedModel.temperature,
          top_k: selectedModel.top_k,
          top_p: selectedModel.top_p,
          repeat_penalty: selectedModel.repeat_penalty,
          presence_penalty: selectedModel.presence_penalty,
          frequency_penalty: selectedModel.frequency_penalty,
          seed: selectedModel.seed,
          num_predict: selectedModel.num_predict,
          stop: selectedModel.stop,
          system_prompt: selectedModel.system_prompt,
        }
      });
    } else {
      setModel(selectedModel);
    }
    setOpen(false);
  }, [setModel]);

  const openaiToOllama = useCallback((id: string) => ({
    model: id,
    name: id
  }), []);

  const truncateModelName = useCallback((name: string) => {
    try {
      return name.endsWith(':latest') ? name.slice(0, -7) : name;
    } catch (error) {
      return name;
    }
  }, []);

  const { userAssistants, availableOllamaModels, openai } = useMemo(() => ({
    userAssistants: assistants || [],
    openai: openaiModels.data || [],
    availableOllamaModels: ollamaModels.data?.models?.filter(
      (m: OllamaModelData) => !assistants?.some(assistant => assistant.name === m.name)
    ) || []
  }), [assistants, ollamaModels.data, openaiModels.data]);

  if (ollamaModels.isLoading || isLoadingAssistants) {
    return (
      <div className="flex justify-center items-center w-full h-48">
        <Skeleton className="w-32 h-8" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex justify-start gap-1 border-0 w-fit max-w-sm font-semibold text-sm select-none"
          >
            {model ? truncateModelName(model.name) : 'Select model...'}
            <CaretSortIcon className="opacity-50 ml-2 w-4 h-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-fit max-w-sm" align="start">
          <Command>
            <CommandInput placeholder="Search model..." className="h-9" />
            <CommandList>
              <CommandEmpty>No model found...</CommandEmpty>
              {agents && agents?.length > 0 && (
                <CommandGroup heading="User Assistants">

                  {agents.map(agent => (
                    <CommandItem
                      key={agent.id}
                      className="w-[250px] min-w-[250px] max-w-[250px] truncate whitespace-nowrap"
                      value={agent.display_name}
                      onSelect={() => handleModelSelect(agent)}
                    >
                      <span className="truncate">{agent.display_name}</span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          model?.name === agent.display_name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  )
                  )}
                </CommandGroup>
              )}
              {agents && agents?.length > 0 && availableOllamaModels.length > 0 && (
                <CommandSeparator />
              )}
              {availableOllamaModels.length > 0 && (
                <CommandGroup heading="Available Ollama Models">
                  {availableOllamaModels.map((m: OllamaModel) => (
                    <CommandItem
                      key={m.name}
                      className="w-[250px] min-w-[250px] max-w-[250px] truncate whitespace-nowrap"
                      value={m.name}
                      onSelect={() => handleModelSelect(m)}
                    >
                      <span className="truncate">{truncateModelName(m.name)}</span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          model?.name === m.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
              {openai.length > 0 && (
                <CommandGroup heading="Available OpenAI Models">
                  {openai.map((m: OllamaModel) => (
                    <CommandItem
                      key={m.id}
                      className="w-[250px] min-w-[250px] max-w-[250px] truncate whitespace-nowrap"
                      value={m.id}
                      onSelect={() => { handleModelSelect(openaiToOllama(m.id)) }}
                    >
                      <span className="truncate">{m.id}</span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          model?.name === m.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {model && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="font-normal text-muted-foreground text-xs"
                variant="link"
                size="icon"
              >
                <Heart className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={3} className="bg-accent">
              Set as default model
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
