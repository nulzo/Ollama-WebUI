import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/theme/theme-provider';
import { Check, Settings2 } from 'lucide-react';
import { colorThemes } from '@/config/themes';
import { cn } from '@/lib/utils';

export function SettingsModal() {
  const { color, setColor, theme } = useTheme();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="mt-auto rounded-lg" aria-label="Account">
          <Settings2 className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Make changes to your profile here!</DialogDescription>
        </DialogHeader>
        <div className="">
          <div className="flex flex-col items-start gap-4">
            <Label htmlFor="name" className='flex gap-1 items-center align-middle'>
              Color Theme:
              <div className='text-muted-foreground text-xs'>
                {color}
              </div>
            </Label>
            
            <div className="flex gap-5 w-fit flex-wrap">
              {Object.entries(colorThemes).map(([key, value]) => {
                const isActive = color === key;
                return (
                  <Button
                    variant="ghost"
                    key={key}
                    onClick={() => {
                      setColor(key);
                    }}
                    className={cn('justify-start h-10 px-1 py-3 rounded-lg', isActive && 'border border-primary ring-1 ring-primary')}
                    style={
                      {
                        '--theme-primary': `hsl(${theme === 'dark' ? value.dark.primary : value.light.primary})`,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--theme-primary]'
                      )}
                    >
                      {isActive && <Check className="h-4 w-4 text-primary-foreground" />}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
