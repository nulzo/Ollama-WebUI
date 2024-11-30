import { Agent } from './agent-sidebar';
import { AgentForm } from './agent-form';
import { PlusCircle } from 'lucide-react';

interface AgentContentProps {
  selectedAgent: Agent | null;
}

export function AgentContent({ selectedAgent }: AgentContentProps) {
  if (!selectedAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
        <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Agent Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select an existing agent to edit or create a new one
        </p>
      </div>
    );
  }

  return <AgentForm agent={selectedAgent} />;
}