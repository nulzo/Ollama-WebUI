import { useMemo, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgentForm } from '@/features/agents/components/agent-form';
import { useAgents } from '@/features/agents/api/get-agents';
import { useAgent } from '@/features/agents/api/get-agent';
import { useCreateAgent } from '@/features/agents/api/create-agent';
import { useUpdateAgent } from '@/features/agents/api/update-agent';
import { Agent } from '@/features/agents/types/agent';


export function ModelsRoute() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterFamily, setFilterFamily] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const defaultAgent: Agent = {
    id: '',
    display_name: '',
    description: '',
    icon: '',
    model: 'gpt-4',
    enabled: true,
    files: false,
    system_prompt: '',
    function_call: false,
    vision: false,
    max_output: 2048,
    tokens: 2048,
    num_ctx: 4096,
    low_vram: false,
    embedding_only: false,
    seed: 0,
    num_predict: 128,
    top_k: 40,
    top_p: 0.95,
    tfs_z: 1,
    typical_p: 1,
    repeat_last_n: 64,
    temperature: 0.8,
    repeat_penalty: 1.1,
    presence_penalty: 0,
    frequency_penalty: 0,
    penalize_newline: false,
    stop: [],
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    user_id: '',
  };

  // Replace assistants queries with agent queries
  const { isLoading, data: agents } = useAgents();
  const { data: selectedAgentDetails, isLoading: isLoadingDetails } = useAgent({
    agentId: selectedAgent?.id ?? '',
  });

  // Add mutation hooks
  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();

  const handleCreateNew = (selectedModel?: string) => {
    setSelectedAgent({
      ...defaultAgent,
      id: Date.now().toString(),
      model: selectedModel || defaultAgent.model, // Use selected model if provided
    });
    setIsCreating(true);
  };

  const handleModelSelect = (modelId: string) => {
    handleCreateNew(modelId);
  };

  const handleSave = async () => {
    if (!selectedAgent) return;

    try {
      if (isCreating) {
        await createAgentMutation.mutateAsync({ data: selectedAgent });
      } else {
        await updateAgentMutation.mutateAsync({
          agentId: selectedAgent.id,
          data: selectedAgent,
        });
      }

      setIsCreating(false);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Failed to save agent:', error);
    }
  };

  const filteredAndSortedAgents = useMemo(() => {
    return agents
      ?.filter((agent: Agent) => agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a: Agent, b: Agent) => {
        if (sortBy === 'name') return a.display_name.localeCompare(b.display_name);
        if (sortBy === 'modified')
          return new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime();
        return 0;
      });
  }, [agents, searchTerm, sortBy]);

  return (
    <div className="p-12 w-full h-screen">
      <div className="flex flex-col w-full h-full">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="font-bold text-4xl">
            {selectedAgent ? 'Edit Agent' : 'Create New Agent'}
          </h1>
          <h3 className="text-lg text-muted-foreground">
            {selectedAgent
              ? 'Modify your agent settings and parameters.'
              : 'Configure your agent settings and parameters.'}
          </h3>
        </div>

        {/* Grid container that fills remaining space */}
        <div className="flex-1 gap-6 grid grid-cols-4 min-h-0">
          {/* Left card - always fills parent height */}
          <div className="col-span-4 lg:col-span-2 2xl:col-span-1 h-full">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Fine-Tuned Agents
                  <Button onClick={() => handleCreateNew()} size="sm">
                    <PlusCircle className="mr-2 w-4 h-4" /> New Agent
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-4">
                    {/* Search and filter controls */}
                    <div className="relative">
                      <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground transform -translate-y-1/2" />
                      <Input
                        placeholder="Search agents..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="modified">Last Modified</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterFamily} onValueChange={setFilterFamily}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Models</SelectItem>
                          <SelectItem value="llama">Llama</SelectItem>
                          {/* Add other model families */}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Agent list */}
                    <ScrollArea className="h-full">
                      {isLoading ? (
                        <div className="flex justify-center p-4">
                          <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
                        </div>
                      ) : filteredAndSortedAgents?.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No agents found</div>
                      ) : (
                        filteredAndSortedAgents?.map((agent: Agent) => (
                          <div
                            key={agent.id}
                            className={`flex items-center p-2 hover:bg-accent rounded-md cursor-pointer ${selectedAgent?.id === agent.id ? 'bg-accent' : ''
                              }`}
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsCreating(false);
                            }}
                          >
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={agent.icon} alt={agent.display_name} />
                              <AvatarFallback>{agent.display_name.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium text-sm">{agent.display_name}</p>
                              <p className="text-muted-foreground text-xs">
                                Modified: {new Date(agent.modified_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right side - takes up 3 columns */}
          <div className="col-span-4 lg:col-span-2 2xl:col-span-3 h-full">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>{isCreating ? 'Create New Agent' : 'Edit Agent'}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {selectedAgent ? (
                    <AgentForm
                      agent={selectedAgent}
                      onSubmit={async (formData) => {
                        try {
                          if (isCreating) {
                            await createAgentMutation.mutateAsync({ 
                              data: { ...formData, id: selectedAgent?.id } 
                            });
                          } else {
                            await updateAgentMutation.mutateAsync({
                              agentId: selectedAgent?.id ?? '',
                              data: formData
                            });
                          }
                           setIsCreating(false);
                          setSelectedAgent(null);
                        } catch (error) {
                          console.error('Failed to save agent:', error);
                        }
                      }}
                      isLoading={createAgentMutation.isPending || updateAgentMutation.isPending}
                    />
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Select an agent to edit or create a new one.
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
