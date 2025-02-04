import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Code2, MessageSquare, Wand2, Database, Bot } from 'lucide-react';
import { Head } from '@/components/helmet';
import { AgentForm } from '@/features/agents/components/agent-form';
import { Agent } from '@/features/agents/types/agent';
import { useAgents } from '@/features/agents/api/get-agents';
import { useCreateAgent } from '@/features/agents/api/create-agent';
import { useUpdateAgent } from '@/features/agents/api/update-agent';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDeleteAgent } from '@/features/agents/api/delete-agent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Prompt } from '@/features/prompts/prompt';
import { useCreatePrompt } from '@/features/prompts/api/create-prompt';
import { usePrompts } from '@/features/prompts/api/get-prompts';
import { useUpdatePrompt } from '@/features/prompts/api/update-prompt';
import { useDeletePrompt } from '@/features/prompts/api/delete-prompt';
import { PromptCard } from '@/features/prompts/prompt-card';
import { PromptForm } from '@/features/prompts/prompt-form';

const AgentCard = ({
  agent,
  onEdit,
  onDelete,
}: {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: () => void;
}) => (
  <motion.div
    className="bg-secondary rounded-lg p-6 transition-shadow duration-300 flex flex-col h-full relative"
    whileHover={{ scale: 1.0 }}
  >
    {/* Menu button in top-right corner */}
    <div className="absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(agent)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Card content container */}
    <div className="flex-1">
      {/* Agent info section */}
      <div className="flex items-center gap-2 mb-4">
        <Avatar className="w-8 h-8">
          {agent.icon ? (
            <AvatarImage src={agent.icon} alt={agent.display_name} />
          ) : (
            <AvatarFallback className="bg-primary/10">
              <Bot className="size-4 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-semibold whitespace-nowrap truncate">{agent.display_name}</h2>
        </div>
      </div>
      <p className="text-sm text-muted-foreground truncate">{agent.description}</p>

      {/* Badges section */}
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
    </div>
  </motion.div>
);

const ModelTuning = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: agents } = useAgents();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();

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
    if (selectedAgent) {
      await updateAgent.mutateAsync({
        agentId: selectedAgent.id,
        data: values,
      });
    } else {
      console.log('Creating new agent:', values);
      await createAgent.mutateAsync({
        data: values,
      });
    }
    setIsCreateDialogOpen(false);
  };

  const handleDelete = async (agent: Agent) => {
    try {
      await deleteAgent.mutateAsync({ agentId: agent.id });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  return (
    <>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Agent</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a custom AI agent with specific capabilities and parameters.
          </p>
          <Button className="w-full gap-2" onClick={handleCreateAgent}>
            <Plus className="size-4" />
            Create Agent
          </Button>
        </motion.div>

        {filteredAgents?.map((agent: Agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={handleEditAgent}
            onDelete={() => handleDelete(agent)}
          />
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
    </>
  );
};

const CustomFunctions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Create Function</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Build custom functions that can be called by your AI models.
        </p>
        <Button className="w-full gap-2">
          <Code2 className="size-4" />
          New Function
        </Button>
      </motion.div>

      {/* Add more cards for existing functions */}
    </div>
  );
};

const SavedPrompts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
    const { data: prompts } = usePrompts();
    const createPrompt = useCreatePrompt();
    const updatePrompt = useUpdatePrompt();
    const deletePrompt = useDeletePrompt();
  
    const filteredPrompts = prompts?.data && prompts?.data?.length > 0 ? prompts?.data?.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
  
    const handleCreatePrompt = () => {
      setSelectedPrompt(null);
      setIsCreateDialogOpen(true);
    };
  
    const handleEditPrompt = (prompt: Prompt) => {
      setSelectedPrompt(prompt);
      setIsCreateDialogOpen(true);
    };
  
    const handleSubmit = async (values: any) => {
      try {
        if (selectedPrompt) {
          await updatePrompt.mutateAsync({
            promptId: selectedPrompt.id,
            data: values,
          });
        } else {
          await createPrompt.mutateAsync({
            data: values,
          });
        }
        setIsCreateDialogOpen(false);
      } catch (error) {
        console.error('Error saving prompt:', error);
      }
    };
  
    const handleDelete = async (prompt: Prompt) => {
      try {
        await deletePrompt.mutateAsync({ promptId: prompt.id });
      } catch (error) {
        console.error('Error deleting prompt:', error);
      }
    };
  
    return (
      <>
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search prompts..."
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Create Prompt Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save and organize your most effective prompts for quick access.
            </p>
            <Button className="w-full gap-2" onClick={handleCreatePrompt}>
              <MessageSquare className="size-4" />
              New Template
            </Button>
          </motion.div>
  
          {(filteredPrompts && filteredPrompts?.length > 0) ? filteredPrompts?.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEditPrompt}
              onDelete={() => handleDelete(prompt)}
            />
          )) : (
            <div className="bg-secondary rounded-lg p-6">
              <p className="text-sm text-muted-foreground">No prompts found</p>
            </div>
          )}
        </div>
  
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </DialogTitle>
            </DialogHeader>
            <PromptForm prompt={selectedPrompt} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </>
    );
  };

const tabs = [
  {
    name: 'Fine-Tune Agents',
    icon: <Bot className="size-4" />,
  },
  {
    name: 'Functions',
    icon: <Code2 className="size-4" />,
  },
  {
    name: 'Prompts',
    icon: <MessageSquare className="size-4" />,
  },
  {
    name: 'Knowledge',
    icon: <Database className="size-4" />,
  },
];

export function WorkspaceRoute() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const firstElement = tabRefs.current[0];
      if (firstElement) {
        const { offsetLeft, offsetWidth } = firstElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  const renderActiveContent = () => {
    switch (activeIndex) {
      case 0:
        return <ModelTuning />;
      case 1:
        return <CustomFunctions />;
      case 2:
        return <SavedPrompts />;
      default:
        return null;
    }
  };

  return (
    <div className="relative z-10 pt-12 flex flex-col flex-auto justify-between scrollbar-hidden w-[100%] max-w-full h-0 overflow-auto">
      <div className="relative mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl h-full">
        <div className="flex flex-col h-full">
          <Head title="Workspace" description="Manage your AI workspace" />

          <div className="flex-1 overflow-auto">
            <div className="px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold">Workspace</h1>
                  <p className="text-lg text-muted-foreground">
                    Fine-tune models, create functions, and manage prompts
                  </p>
                </div>
              </div>

              <div className="relative mb-8">
                {/* Hover Highlight */}
                <div
                  className="absolute h-[30px] transition-all duration-300 ease-out bg-secondary rounded-[6px] flex items-center"
                  style={{
                    ...hoverStyle,
                    opacity: hoveredIndex !== null ? 1 : 0,
                  }}
                />

                {/* Active Indicator */}
                <div
                  className="absolute bottom-[-6px] h-[2px] bg-primary transition-all duration-300 ease-out"
                  style={activeStyle}
                />

                {/* Tabs */}
                <div className="relative flex space-x-[6px] items-center">
                  {tabs.map((tab, index) => (
                    <div
                      key={index}
                      ref={el => (tabRefs.current[index] = el)}
                      className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                        index === activeIndex ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setActiveIndex(index)}
                    >
                      <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
                        {tab.icon}
                        {tab.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">{renderActiveContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
