import { useTools, useDeleteTool } from '@/features/tools/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, Code, Info, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { useModelStore } from '@/features/models/store/model-store';
import { Separator } from '@/components/ui/separator';

export function ToolsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: tools, isLoading } = useTools();
  const deleteTool = useDeleteTool();
  const [functionCallingEnabled, setFunctionCallingEnabled] = useState(false);
  const model = useModelStore(state => state.model);
  const setModel = useModelStore(state => state.setModel);

  // Initialize function calling state from model
  useEffect(() => {
    if (model) {
      setFunctionCallingEnabled(model.tools_enabled || false);
    }
  }, [model]);

  // Update model when function calling toggle changes
  const handleFunctionCallingToggle = (enabled: boolean) => {
    setFunctionCallingEnabled(enabled);
    if (model) {
      setModel({
        ...model,
        tools_enabled: enabled
      });
      
      toast({
        title: `Function calling ${enabled ? 'enabled' : 'disabled'}`,
        description: `AI models will ${enabled ? 'now' : 'no longer'} be able to call your functions.`,
      });
    }
  };

  const handleDelete = async (toolId: string) => {
    try {
      await deleteTool.mutateAsync({ toolId });
      toast({
        title: 'Function deleted',
        description: 'The function was successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete function.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-bold text-3xl">Functions</h1>
          <p className="text-muted-foreground mt-1">Create and manage functions that can be called by AI models</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="function-calling-toggle" className="font-medium mb-1">
                    Function Calling
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {functionCallingEnabled ? 'Enabled' : 'Disabled'} for all chats
                  </p>
                </div>
                <Switch 
                  id="function-calling-toggle" 
                  checked={functionCallingEnabled} 
                  onCheckedChange={handleFunctionCallingToggle}
                />
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={() => navigate('/tools/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Function
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 flex justify-center items-center">
            <div className="animate-pulse text-muted-foreground">Loading functions...</div>
          </Card>
        ) : tools?.data?.length === 0 ? (
          <Card className="p-8 flex flex-col items-center justify-center text-center">
            <Code className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No functions yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Create your first function to extend the capabilities of AI models with custom tools.
            </p>
            <Button onClick={() => navigate('/tools/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Function
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tools?.data?.map(tool => (
              <Card key={tool.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <Badge variant={tool.is_enabled ? "default" : "outline"} className="text-xs">
                        {tool.is_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        {tool.language}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Info className="h-3 w-3" />
                        <span>Parameters: {Object.keys(tool.parameters?.properties || {}).length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {tool.is_enabled ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>
                          {tool.is_enabled 
                            ? "Available to AI models" 
                            : "Not available to AI models"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 flex md:flex-col justify-end items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/tools/${tool.id}`)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit function</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(tool.id)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete function</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
