import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUp, Origami } from 'lucide-react';
import { useAssistant } from '@/features/assistant/api/get-assistant';
import { useUpdateAssistant } from '@/features/assistant/api/update-assistant';
import { toast } from '@/components/ui/use-toast';

interface AssistantCardProps {
  assistantId: number;
  onClose: () => void;
}

export function AssistantCard({ assistantId, onClose }: AssistantCardProps) {
  const { data: assistantData, isLoading } = useAssistant(assistantId);
  const updateAssistantMutation = useUpdateAssistant();

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (assistantData) {
      setName(assistantData.name);
      setDisplayName(assistantData.display_name);
      setDescription(assistantData.description || '');
      setAvatar(assistantData.icon);
    }
  }, [assistantData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = () => {
    updateAssistantMutation.mutate(
      {
        data: {
          name,
          display_name: displayName,
          description,
          icon: avatar,
        },
        assistantId,
      },
      {
        onSuccess: updatedAssistant => {
          toast({
            title: `${updatedAssistant.name} updated successfully`,
            description: 'Your changes have been saved.',
          });
          onClose();
        },
        onError: error => {
          toast({
            title: 'Error updating assistant',
            description: `There was an error saving your changes. ${error.message}`,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Assistant</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4 items-center">
        <div className="relative flex w-24 h-24 items-center justify-center mx-auto mb-8">
          <div className="bg-primary flex justify-center items-center rounded-xl w-full h-full overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <Origami strokeWidth="1.5" className="size-10 text-primary-foreground" />
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="absolute -bottom-2 -right-2 rounded-lg"
            onClick={handleUploadClick}
            aria-label="Upload new profile picture"
          >
            <ImageUp className="h-4 w-4" />
          </Button>
          <Input
            id="avatar-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="" htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="" htmlFor="displayName">
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="" htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <Button className="w-full" onClick={handleSaveChanges}>
        Save Changes
      </Button>
    </DialogContent>
  );
}
