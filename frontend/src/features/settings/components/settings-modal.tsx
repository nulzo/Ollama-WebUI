import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/theme/theme-provider';
import { Check, Settings2 } from 'lucide-react';
import { baseColors } from '@/config/themes';
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
            <Label htmlFor="name" className="text-right">
              Color Theme
            </Label>
            <div className='flex gap-2'>
              <Button 
                className='h-8 w-8 rounded-lg bg-purple-400 hover:bg-purple-300' 
                onClick={() => {setColor("purple")}}
              />
              <Button 
                className='h-8 w-8 rounded-lg bg-blue-400'
                onClick={() => setColor("blue")}
              />
              <Button 
                className='h-8 w-8 rounded-lg bg-white border-black'
                onClick={() => setColor("default")}
              />
              <Button 
                className='h-8 w-8 rounded-lg bg-orange-400'
                onClick={() => setColor("orange")}
              />
              {baseColors.map((current_color) => {
                const isActive = color === current_color.name
                return (
                  <Button
                    variant={"outline"}
                    size="sm"
                    key={current_color.name}
                    onClick={() => {
                      setColor(
                        current_color.name
                      )
                    }}
                    className={cn(
                      "justify-start",
                      isActive && "border-2 border-primary"
                    )}
                    style={
                      {
                        "--theme-primary": `hsl(${
                          current_color?.activeColor[theme === "dark" ? "dark" : "light"]
                        })`,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={cn(
                        "mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]"
                      )}
                    >
                      {isActive && <Check className="h-4 w-4 text-white" />}
                    </span>
                    {current_color.label}
                </Button>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          {/* <Button type="submit">Save changes</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
