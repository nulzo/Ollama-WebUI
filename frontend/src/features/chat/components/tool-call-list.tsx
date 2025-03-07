import { useState } from 'react';
import { Message } from '@/features/chat/types/message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Code, Terminal, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ToolCallListProps {
  message: Message;
}

export function ToolCallList({ message }: ToolCallListProps) {
  const [openToolCalls, setOpenToolCalls] = useState<Record<string, boolean>>({});

  if (!message.tool_calls || message.tool_calls.length === 0) {
    return null;
  }

  const toggleToolCall = (id: string) => {
    setOpenToolCalls(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format JSON arguments for display
  const formatArguments = (args: string) => {
    try {
      const parsed = JSON.parse(args);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return args;
    }
  };

  // Find the corresponding result for a tool call
  const findResult = (toolCallId: string) => {
    if (!message.tool_results) return null;
    return message.tool_results.find(result => result.tool_call_id === toolCallId);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wrench className="h-4 w-4" />
        <span>Function calls: {message.tool_calls.length}</span>
      </div>
      
      {message.tool_calls.map((toolCall) => {
        const result = findResult(toolCall.id);
        const isOpen = openToolCalls[toolCall.id] || false;
        
        return (
          <Collapsible 
            key={toolCall.id} 
            open={isOpen} 
            onOpenChange={() => toggleToolCall(toolCall.id)}
            className="border rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full flex justify-between items-center p-3 h-auto"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm">{toolCall.function.name}</span>
                  <Badge variant={result?.error ? "destructive" : "outline"} className="text-xs">
                    {result?.error ? "Error" : "Success"}
                  </Badge>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-3 pt-0 space-y-3">
                <div>
                  <h4 className="text-xs font-medium mb-1 text-muted-foreground">Arguments:</h4>
                  <pre className="bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto">
                    {formatArguments(toolCall.function.arguments)}
                  </pre>
                </div>
                
                {result && (
                  <div>
                    <h4 className="text-xs font-medium mb-1 text-muted-foreground">
                      {result.error ? "Error:" : "Result:"}
                    </h4>
                    <pre className={`p-2 rounded-md text-xs font-mono overflow-x-auto ${result.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                      {result.error || JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
} 