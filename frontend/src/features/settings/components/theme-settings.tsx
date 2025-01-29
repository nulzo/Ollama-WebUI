import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';
import { Check, Settings2 } from 'lucide-react';
import { colorThemes } from '@/config/themes';
import { cn } from '@/lib/utils';
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSettings() {
  const { color, setColor, theme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Settings2 className="size-3.5 mr-1.5" /> Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-2">
        <div className="flex gap-2 flex-wrap w-[200px]">
          {Object.entries(colorThemes).map(([key, value]) => {
            const isActive = color === key;
            return (
              <Button
                variant="ghost"
                key={key}
                onClick={() => setColor(key)}
                className={cn(
                  'h-8 w-8 p-0 rounded-lg',
                  isActive && 'border border-primary ring-1 ring-primary'
                )}
                style={
                  {
                    '--theme-primary': `hsl(${
                      theme === 'dark' ? value.dark.primary : value.light.primary
                    })`,
                  } as React.CSSProperties
                }
              >
                <span
                  className={cn(
                    'flex h-full w-full items-center justify-center rounded-lg bg-(--theme-primary)'
                  )}
                >
                  {isActive && <Check className="h-3 w-3 text-primary-foreground" />}
                </span>
              </Button>
            );
          })}
        </div>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
