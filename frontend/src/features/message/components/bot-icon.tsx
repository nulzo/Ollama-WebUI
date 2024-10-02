import { AssistantCard } from '@/features/models/components/model-card';
import { Origami } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAssistant } from '@/features/assistant/api/get-assistant';

interface BotIconProps {
  assistantId: number;
}

export const BotIcon = ({ assistantId }: BotIconProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: assistant, isLoading } = useAssistant(assistantId);

  const handleClose = () => setIsOpen(false);

  const renderIcon = () => {
    if (isLoading) {
      return <div className="animate-pulse bg-primary-foreground w-5 h-5 rounded-full" />;
    }

    if (assistant?.icon) {
      return (
        <img
          src={assistant.icon}
          alt={assistant.display_name}
          className="object-cover size-9 rounded-lg"
        />
      );
    }

    return <Origami strokeWidth="1.5" className=" m-2 size-5 text-primary-foreground" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative bg-primary rounded-lg mt-1 cursor-pointer">
          {renderIcon()}
          <div className="absolute -right-0.5 -bottom-0.5 rounded-full h-2.5 w-2.5 bg-green-400 ring-background ring-2" />
        </div>
      </DialogTrigger>
      <AssistantCard assistantId={assistantId} onClose={handleClose} />
    </Dialog>
  );
};
