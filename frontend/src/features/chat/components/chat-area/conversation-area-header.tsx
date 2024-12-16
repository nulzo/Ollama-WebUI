import { MoonStar, SlidersHorizontal, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { ModelSelect } from '@/features/models/components/model-select.tsx';
import { useTheme } from '@/components/theme/theme-provider.tsx';
import { useMemo, useState } from 'react';
import { useModelStore } from '@/features/models/store/model-store.ts';
import { useModels } from '@/features/models/api/get-models.ts';
import { formatModels } from '@/features/models/utils/format-models.ts';

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

export function ConversationAreaHeader() {
  const { model, setModel } = useModelStore();
  const { data: modelsData } = useModels();

  const formattedModels = useMemo(() => formatModels(modelsData), [modelsData]);

  const handleModelSelect = (selectedValue: string) => {
    const selectedModelData = formattedModels.find(m => m.value === selectedValue);

    if (selectedModelData) {
      setModel({
        name: selectedModelData.label,
        model: selectedModelData.value,
        modified_at: new Date().toISOString(), // Since this might not be in the formatted data
        size: 0, // You might want to get this from the original modelsData
        digest: '', // You might want to get this from the original modelsData
        details: {
          parent_model: selectedModelData.details.parent_model || '',
          format: selectedModelData.details.format || '',
          family: selectedModelData.details.family || '',
          families: [],
          parameter_size: selectedModelData.details.size || '',
          quantization_level: selectedModelData.details.quantization || '',
        },
      });
    }
  };

  return (
    <div className="top-0 z-10 sticky flex flex-row justify-between items-center gap-3 col-span-4 bg-background/25 backdrop-blur px-4 py-2.5 rounded-b-none grow-0 w-full h-14">
      <div className="flex items-center gap-3 font-semibold text-lg ps-8">
        <ModelSelect value={model?.name} onValueChange={handleModelSelect} />
      </div>
      <div className="flex items-center gap-1 pe-6">
        <Button size="icon" variant="ghost">
          <SlidersHorizontal className="size-4" strokeWidth="1.5" />
        </Button>
        <ThemeToggleButton />
      </div>
    </div>
  );
}
