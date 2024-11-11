import { MoonStar, SlidersHorizontal, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { ModelSelect } from '@/features/models/components/model-select.tsx';
import { useTheme } from '@/components/theme/theme-provider.tsx';
import { useState } from 'react';

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
  return (
    <div className="sticky py-2.5 top-0 flex flex-row z-10 grow-0 px-4 gap-3 justify-between items-center col-span-4 w-full rounded-b-none bg-background/25 backdrop-blur h-14">
      <div className="flex items-center gap-3 font-semibold text-lg ps-8">
        <ModelSelect />
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
