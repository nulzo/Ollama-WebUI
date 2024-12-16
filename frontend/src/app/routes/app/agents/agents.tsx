import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AgentForm } from '@/features/agents/components/agent-form';
import { Agent } from '@/features/agents/types/agent';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAgents } from '@/features/agents/api/get-agents.ts';
import { useCreateAgent } from '@/features/agents/api/create-agent.ts';
import { useUpdateAgent } from '@/features/agents/api/update-agent.ts';
import { Head } from '@/components/helmet';

const AgentCard = ({ agent, onEdit }: { agent: Agent; onEdit: (agent: Agent) => void }) => (
  <motion.div
    className="bg-secondary rounded-lg shadow-md p-6 transition-shadow duration-300"
    whileHover={{ scale: 1.0 }}
  >
    <div className="flex items-center gap-4">
      {agent.icon && (
        <img src={agent.icon} alt={agent.display_name} className="w-12 h-12 rounded-full" />
      )}
      <div className="flex-1">
        <h2 className="text-xl font-semibold whitespace-nowrap truncate">{agent.display_name}</h2>
        <p className="text-sm text-muted-foreground truncate">{agent.description}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mt-4">
      <Badge variant="outline" className="text-xs border-primary bg-primary/10 text-primary">
        {agent.model}
      </Badge>
      {agent.vision && (
        <Badge variant="outline" className="text-xs">
          Vision
        </Badge>
      )}
      {agent.files && (
        <Badge variant="outline" className="text-xs">
          Files
        </Badge>
      )}
      {agent.function_call && (
        <Badge variant="outline" className="text-xs">
          Functions
        </Badge>
      )}
    </div>

    <div className="flex justify-end mt-4">
      <Button onClick={() => onEdit(agent)} className="w-full">
        Edit Agent
      </Button>
    </div>
  </motion.div>
);

export function AgentsRoute() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: agents, isLoading } = useAgents();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const filteredAgents = agents?.filter(agent =>
    agent.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    // Handle create/update logic here
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <Head title="Agents" description="Create and manage your AI agents" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mt-16">Agents</h1>
            <p className="text-lg text-muted-foreground">Create and manage your AI agents</p>
          </div>
          <Button onClick={handleCreateAgent} className="gap-2">
            <Plus className="size-4" />
            Create Agent
          </Button>
        </div>

        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={20}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents?.map((agent: Agent) => (
            <AgentCard key={agent.id} agent={agent} onEdit={handleEditAgent} />
          ))}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAgent ? 'Edit Agent' : 'Create New Agent'}</DialogTitle>
            </DialogHeader>
            <AgentForm agent={selectedAgent} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
