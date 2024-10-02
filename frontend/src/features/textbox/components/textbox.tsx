import { Textarea } from '@/components/ui/textarea.tsx';
import { Command, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { ChangeEvent, FormEvent } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ITextbox {
  value: string;
  model: string;
  setValue: (value: string) => void;
  onSubmit: () => void;
}

export function Textbox({ value, setValue, onSubmit, model }: ITextbox) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value);
  }

  function onKeyPress(event: any) {
    switch (event.key) {
      case 'Enter':
        if (event.shiftKey) {
          event.target.style.height = '';
          event.target.style.height = Math.min(event.target.scrollHeight, 200) + 'px';
          setValue(value + '\n');
          event.preventDefault();
        } else {
          event.preventDefault();
          handleSubmit(event as unknown as FormEvent<HTMLFormElement>);
        }
        break;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValue('');
    event.target.style.height = '';
    event.target.style.height = Math.min(event.target.scrollHeight, 200) + 'px';
    onSubmit();
  }

  return (
    <div className="z-10 max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl px-2.5 md:px-4 mx-auto inset-x-0 border-spacing-2 p-2 relative overflow-hidden ring-primary/50 rounded-2xl border border-foreground/20 bg-accent focus-within:border-primary focus-within:ring-1 w-full h-[58px]">
      {/* <TooltipProvider>
        <Tooltip>
          <TooltipTrigger> */}
      <Textarea
        id="chatMessage"
        key="chatMessageArea"
        className="z-0 focus:border-transparent py-2.5 pl-3 w-[90%] md:w-[93%] lg:w-[94%] xl:w-[95%] 2xl:w-[96%] scrollbar-hidden focus-visible:ring-0 resize-none border-0 shadow-none items-center align-middle"
        value={value}
        rows={1}
        onChange={event => handleChange(event)}
        onKeyDown={onKeyPress}
        disabled={!model}
        placeholder="Message CringeGPT"
      />
      <div className="absolute bottom-3 right-3">
        <Button
          type="submit"
          disabled={value.length === 0 || !model}
          onClick={(event: FormEvent<any>) => handleSubmit(event)}
          size="sm"
          className="ml-auto gap-1.5 text-primary-foreground"
        >
          Send
          <kbd className="px-1 gap-1 rounded inline-flex justify-center items-center py-1 font-mono text-sm">
            <Command className="size-2.5" />
            <CornerDownLeft className="size-2.5" />
          </kbd>
          <span className="sr-only">Message CringeGPT</span>
        </Button>
      </div>
      {/* </TooltipTrigger>
          <TooltipContent className={`bg-destructive text-destructive-foreground ${model && 'hidden'}`}>
            <p>Select a model first</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider> */}
    </div>
  );
}
