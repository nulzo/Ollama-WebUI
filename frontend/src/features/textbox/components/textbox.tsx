import { Textarea } from '@/components/ui/textarea.tsx';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

export interface ITextbox {
  value: string;
  model: string;
  setValue: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function Textbox({ value, setValue, onSubmit, model }: ITextbox) {
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
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
          handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
        }
        break;
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(event);
  }

  return (
    <div className="z-10 max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-5xl px-2.5 md:px-4 mx-auto inset-x-0 border-spacing-2 p-2 relative overflow-hidden rounded-2xl border border-foreground/20 bg-accent focus-within:border-primary focus-within:ring-2 w-full h-[58px] focus-within:ring-ring/50">
      <Textarea
        id="chatMessage"
        key="chatMessageArea"
        className="z-0 focus:border-transparent py-2.5 pl-3 w-[90%] md:w-[93%] lg:w-[94%] xl:w-[95%] 2xl:w-[96%] scrollbar-hidden focus-visible:ring-0 resize-none border-0 shadow-none items-center align-middle"
        value={value}
        rows={1}
        onChange={event => handleChange(event)}
        onKeyDown={onKeyPress}
        placeholder="Message CringeGPT"
      />
      <div className="absolute bottom-3 right-3">
        <Button
          type="submit"
          disabled={value.length === 0 || !model}
          onClick={(event: React.FormEvent<any>) => handleSubmit(event)}
          size="sm"
          className="ml-auto gap-1.5 text-primary-foreground"
        >
          <Send className="size-3" />
          <span className="sr-only">Message CringeGPT</span>
        </Button>
      </div>
    </div>
  );
}
