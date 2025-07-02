import { useSettings } from './settings-context';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useConversationQuery } from '@/features/chat/api/get-conversation';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUpdateConversation } from '@/features/chat/api/update-conversation';
import { Button } from '@/components/ui/button';

export function SettingsPanel() {
  const { isSettingsOpen } = useSettings();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c');
  const { data: conversation, isLoading } = useConversationQuery(conversationId || '');
  const updateConversationMutation = useUpdateConversation();

  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(1024);

  useEffect(() => {
    if (conversation) {
      setSystemPrompt(conversation.system_prompt || '');
      setTemperature(conversation.temperature || 0.8);
      setMaxTokens(conversation.max_tokens || 1024);
    }
  }, [conversation]);

  const handleSave = () => {
    if (conversationId) {
      updateConversationMutation.mutate({
        conversationId,
        data: {
          system_prompt: systemPrompt,
          temperature: temperature,
          max_tokens: maxTokens,
        },
      });
    }
  };

  if (!conversationId) {
    return null;
  }

  const isSaving = updateConversationMutation.isPending;
  const isFormDisabled = isLoading || isSaving;

  return (
    <div
      className="fixed top-0 right-0 h-full bg-secondary transition-transform duration-300 ease-in-out z-20"
      style={{
        width: '300px',
        transform: isSettingsOpen ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      <div className="p-4 flex flex-col space-y-4 h-full">
        <h2 className="text-lg font-semibold">Settings</h2>
        
        <div className="grow">
          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea 
              id="system-prompt" 
              placeholder="You are a helpful assistant." 
              className="mt-2"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="temperature">Temperature</Label>
            <Slider 
              id="temperature" 
              value={[temperature]} 
              onValueChange={(value) => setTemperature(value[0])}
              min={0} max={2} step={0.1} className="mt-2" 
              disabled={isFormDisabled}
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            <Slider 
              id="max-tokens" 
              value={[maxTokens]}
              onValueChange={(value) => setMaxTokens(value[0])}
              min={256} max={8192} step={256} className="mt-2"
              disabled={isFormDisabled}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isFormDisabled}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
} 