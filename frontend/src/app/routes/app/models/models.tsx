import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Ollama } from '@/services/provider/ollama/ollama.ts';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OLLAMA_SETTINGS } from '@/settings/ollama';
import { Textarea } from '@/components/ui/textarea';
import { useGetModels } from '@/features/models/hooks';
import { Spinner } from '@/components/ui/spinner.tsx';
import { useModelStore } from '@/features/models/store/model-store';

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);

export function ModelsRoute() {
  const [modelInfo, setModelInfo] = useState<any>({});
  const { setModel } = useModelStore(state => ({
    setModel: state.setModel,
  }));

  const models = useGetModels();

  if (models.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const onClick = async (event: any) => {
    const selectedModel = event.target.id;
    const response = await ollama.show({ name: selectedModel }, { stream: false });
    setModel(selectedModel);
    setModelInfo({ ...response, model: selectedModel });
  };

  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="relative hidden md:flex items-start">
        <div className="w-full space-y-4">
          <div className="flex flex-col w-full overflow-y-scroll h-[85vh] rounded-lg border p-4">
            <div className="mt-4">
              <div className="space-y-1">
                {!models.isLoading &&
                  models.data?.models.map((model: any) => (
                    <Button
                      key={model.name}
                      id={model.name}
                      onClick={onClick}
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs truncate"
                    >
                      {model.name}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <ScrollArea className="relative flex h-full max-h-[85vh] min-h-[50vh] flex-col rounded-xl bg-accent/25 border p-4">
          <div className="mx-4">
            {modelInfo && modelInfo?.model && (
              <Card>
                <CardHeader>
                  <CardTitle className="uppercase">{modelInfo?.model || ''}</CardTitle>
                  <CardDescription className="text-xs">{modelInfo?.license || ''}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label>Template</Label>
                    <div className="text-xs leading-3 mb-1 font-normal text-muted-foreground">
                      Model template (usually provided by the model creator).
                    </div>
                    <Textarea className="resize-none" value={modelInfo?.template || ''} />
                  </div>
                  <div>
                    <Label>System</Label>
                    <div className="text-xs leading-3 mb-1 font-normal text-muted-foreground">
                      The System Prompt that the model should conform to.
                    </div>
                    <Textarea className="resize-none" value={modelInfo?.system || ''} placeholder="System Prompt" />
                  </div>
                  <div>
                    <Label>Parameters</Label>
                    <div className="text-xs leading-3 mb-1 font-normal text-muted-foreground">
                      Additional parameters required by the model (usually stop conditions, temperature, top_k, etc.).
                    </div>
                    <Textarea className="resize-none" value={modelInfo?.parameters || ''} placeholder="Parameters" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end items-end gap-3">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="default">Save Changes</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </main>
  );
}
