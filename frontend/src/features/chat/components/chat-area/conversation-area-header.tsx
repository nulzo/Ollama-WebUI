import { MoonStar, PlusCircle, SlidersHorizontal, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { ModelSelect } from '@/features/models/components/model-select.tsx';
import { useTheme } from '@/components/theme/theme-provider.tsx';
import { useMemo, useState, useCallback } from 'react';
import { useModelStore } from '@/features/models/store/model-store.ts';
import { useModels } from '@/features/models/api/get-models.ts';
import { StandardModel } from '@/features/models/types/models';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '@/components/settings/settings-context.tsx';

interface ConversationAreaHeaderProps {
  onNewChat: () => void;
}

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    theme === 'light' ? setTheme('dark') : setTheme('light');
    setTimeout(() => {
      setAnimate(false);
    }, 500);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      {theme === 'dark' ? (
        <MoonStar
          className={`size-4 ${animate ? 'animate-in spin-in-180' : ''}`}
          strokeWidth="1.5"
        />
      ) : (
        <SunIcon
          className={`size-4 ${animate ? 'animate-out spin-out-180' : ''}`}
          strokeWidth="1.5"
        />
      )}
    </Button>
  );
};

export function ConversationAreaHeader({ onNewChat }: ConversationAreaHeaderProps) {
  const { model, setModel } = useModelStore();
  const { data: providerModelsData } = useModels();
  const [searchParams] = useSearchParams();
  const hasConversation = Boolean(searchParams.get('c'));
  const { isSettingsOpen, setIsSettingsOpen } = useSettings();

  // Flatten the ProviderModels object into a single array of StandardModel.
  const formattedModels: StandardModel[] = useMemo(() => {
    if (!providerModelsData) return [];
    // Object.values() returns an array of arrays (one per provider); flat() flattens them into one array.
    return Object.values(providerModelsData).flat();
  }, [providerModelsData]);

  const handleModelSelect = (selectedValue: string) => {
    const selectedModelData = formattedModels.find((m) => m.id === selectedValue);
    if (selectedModelData) {
      setModel({
        id: selectedModelData.id,
        name: selectedModelData.name,
        model: selectedModelData.model,
        provider: selectedModelData.provider,
        max_input_tokens: selectedModelData.max_input_tokens,
        max_output_tokens: selectedModelData.max_output_tokens,
        vision_enabled: selectedModelData.vision_enabled,
        embedding_enabled: selectedModelData.embedding_enabled,
        tools_enabled: selectedModelData.tools_enabled,
      });
    }
  };

  // Find the current model's value to pass to ModelSelect
  const currentModelValue = useMemo(() => {
    if (!model?.model || !formattedModels.length) return undefined;
    // Here we match based on the display name of the model.
    const currentModel = formattedModels.find((m) => m.model === model.model);
    return currentModel?.id;
  }, [model?.model, formattedModels]);

  return (
    <div className="flex flex-row justify-between items-center gap-3 bg-background/25 px-4 py-2.5 w-full h-14 shrink-0">
      <div className="flex items-center gap-3 ps-8 font-semibold text-lg">
        <ModelSelect value={currentModelValue} onValueChange={handleModelSelect} />
        {hasConversation && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onNewChat}
          >
            <PlusCircle className="size-4" strokeWidth="1.5" />
            <span>New Chat</span>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 pe-6">
        <Button size="icon" variant="ghost" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
          <SlidersHorizontal className="size-4" strokeWidth="1.5" />
        </Button>
        <ThemeToggleButton />
      </div>
    </div>
  );
}
