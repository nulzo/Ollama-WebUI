import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface Agent {
  id: string;
  displayName: string;
  enabled: boolean;
  // ... other agent properties
}

// This is a mock function. In a real application, you'd fetch this data from your backend.
const getAgents = () => [
  { id: '1', displayName: 'GPT-4 Agent', enabled: true },
  { id: '2', displayName: 'Claude Agent', enabled: true },
  { id: '3', displayName: 'Custom Agent', enabled: false },
];

interface AgentSidebarProps {
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
}

export function AgentSidebar({ selectedAgent, onSelectAgent }: AgentSidebarProps) {
  const [agents] = useState(getAgents);

  return (
    <Card className="w-64 flex flex-col bg-card/50 backdrop-blur-sm border-muted">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Agents</h2>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <Button
          variant="ghost"
          className={cn('w-full justify-start', !selectedAgent && 'bg-accent')}
          onClick={() => onSelectAgent(null)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Agent
        </Button>

        {agents.map(agent => (
          <Button
            key={agent.id}
            variant="ghost"
            className={cn('w-full justify-start', selectedAgent?.id === agent.id && 'bg-accent')}
            onClick={() => onSelectAgent(agent)}
          >
            {agent.displayName}
          </Button>
        ))}
      </nav>
    </Card>
  );
}
