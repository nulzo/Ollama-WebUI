import { AssistantCard } from '@/features/models/components/model-card';
import { Origami } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAssistant } from '@/features/assistant/api/get-assistant';

interface BotIconProps {
  assistantId: number;
}

// erm
export const BotIcon = ({ assistantId }: BotIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: assistant, isLoading } = useAssistant(assistantId);

  const handleClose = () => setIsOpen(false);

  const renderIcon = () => {
    if (isLoading) {
      return <div className="bg-primary-foreground rounded-full w-5 h-5 animate-pulse" />;
    }

    if (assistant?.icon) {
      return (
        <img
          src={assistant.icon}
          alt={assistant.display_name}
          className="rounded-lg object-cover size-9"
        />
      );
    }

    return <Origami strokeWidth="1.5" className="m-2 text-primary-foreground size-5" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative bg-primary mt-1 rounded-lg cursor-pointer">
          {renderIcon()}
          <div className="-right-0.5 -bottom-0.5 absolute bg-green-400 rounded-full ring-2 ring-background w-2.5 h-2.5" />
        </div>
      </DialogTrigger>
      <AssistantCard assistantId={assistantId} onClose={handleClose} />
    </Dialog>
  );
};
