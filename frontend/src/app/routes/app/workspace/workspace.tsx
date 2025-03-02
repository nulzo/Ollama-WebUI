import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Code2, MessageSquare, Database, Bot } from 'lucide-react';
import { Head } from '@/components/helmet';
import { AgentForm } from '@/features/agents/components/agent-form';
import { Agent } from '@/features/agents/types/agent';
import { useAgents } from '@/features/agents/api/get-agents';
import { useCreateAgent } from '@/features/agents/api/create-agent';
import { useUpdateAgent } from '@/features/agents/api/update-agent';
import { Badge } from '@/components/ui/badge';
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
import { useTools, useDeleteTool } from '@/features/tools/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToolEditor } from '@/features/tools/components/tools-editor';
import { useToast } from '@/components/ui/use-toast';
import { Tool } from '@/features/tools/types/tool';
import { KnowledgeCard } from '@/features/knowledge/components/knowledge-card';
import { KnowledgeForm } from '@/features/knowledge/components/knowledge-form';
import { KnowledgeViewer } from '@/features/knowledge/components/knowledge-viewer';
import { Knowledge } from '@/features/knowledge/knowledge';
import { 
  useKnowledgeList, 
  useCreateKnowledge, 
  useUpdateKnowledge, 
  useDeleteKnowledge, 
  useUploadKnowledge 
} from '@/features/knowledge/api';

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
    className="relative flex flex-col bg-secondary p-6 rounded-lg h-full transition-shadow duration-300"
    whileHover={{ scale: 1.0 }}
  >
    {/* Menu button in top-right corner */}
    <div className="top-4 right-4 absolute">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 w-8 h-8">
            <MoreHorizontal className="w-4 h-4" />
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
          <h2 className="font-semibold text-xl truncate whitespace-nowrap">{agent.display_name}</h2>
          <div className="w-full font-bold text-muted-foreground text-xs">{agent.model}</div>
        </div>
      </div>
      <p className="text-muted-foreground text-sm truncate">{agent.description}</p>

      {/* Badges section */}
      <div className="flex flex-wrap gap-2 mt-4">
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
        <Search className="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2 transform" />
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-6 rounded-lg"
        >
          <h3 className="mb-4 font-semibold text-lg">Create New Agent</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Create a custom AI agent with specific capabilities and parameters.
          </p>
          <Button className="gap-2 w-full" onClick={handleCreateAgent}>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: tools } = useTools();
  const deleteTool = useDeleteTool();

  // Filter tools based on search term
  const filteredTools =
    tools?.data && tools?.data?.length > 0
      ? tools?.data?.filter(
          tool =>
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

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
    <>
      {/* Search bar */}
      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search functions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2 transform" />
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-6 rounded-lg"
        >
          <h3 className="mb-4 font-semibold text-lg">Create Function</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Build custom functions that can be called by your AI models.
          </p>
          <Button
            className="gap-2 w-full"
            onClick={() => {
              setSelectedTool(null);
              setIsCreateDialogOpen(true);
            }}
          >
            <Code2 className="size-4" />
            New Function
          </Button>
        </motion.div>

        {filteredTools && filteredTools.length > 0 ? (
          filteredTools.map(tool => (
            <motion.div
              key={tool.id}
              className="relative flex flex-col bg-secondary p-6 rounded-lg h-full transition-shadow duration-300"
              whileHover={{ scale: 1.0 }}
            >
              {/* Menu button in top-right corner */}
              <div className="top-4 right-4 absolute">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 w-8 h-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedTool(tool.id);
                        setIsCreateDialogOpen(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(tool.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Card content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex justify-center items-center bg-primary/10 rounded-md w-8 h-8">
                    <Code2 className="size-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-xl truncate">{tool.name}</h2>
                    <div className="font-medium text-muted-foreground text-xs">{tool.language}</div>
                  </div>
                </div>
                <p className="mb-4 text-muted-foreground text-sm line-clamp-2">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    Function
                  </Badge>
                  {tool.is_enabled && (
                    <Badge variant="outline" className="text-xs">
                      Enabled
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center items-center bg-transparent p-6 border border-muted-foreground border-dashed rounded-lg"
          >
            <div className="flex flex-col justify-center items-center">
              <h3 className="mx-auto mb-4 font-semibold text-muted-foreground text-lg text-center">No functions found</h3>
              <div className="mx-auto mb-4 text-muted-foreground text-sm text-center">
                Build custom functions that can be called by your AI models.
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTool ? 'Edit Function' : 'Create Function'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ToolEditor />
          </div>
        </DialogContent>
      </Dialog>
    </>
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

  const filteredPrompts =
    prompts?.data && prompts?.data?.length > 0
      ? prompts?.data?.filter(prompt =>
          prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

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
          className="top-1/2 left-3 absolute text-muted-foreground -translate-y-1/2 transform"
          size={20}
        />
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-6 rounded-lg"
        >
          <h3 className="mb-4 font-semibold text-lg">Create Prompt Template</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Save and organize your most effective prompts for quick access.
          </p>
          <Button className="gap-2 w-full" onClick={handleCreatePrompt}>
            <MessageSquare className="size-4" />
            New Template
          </Button>
        </motion.div>

        {filteredPrompts && filteredPrompts?.length > 0 ? (
          filteredPrompts?.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEditPrompt}
              onDelete={() => handleDelete(prompt)}
            />
          ))
        ) : (
          <div className="bg-secondary p-6 rounded-lg">
            <p className="text-muted-foreground text-sm">No prompts found</p>
          </div>
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrompt ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
          </DialogHeader>
          <PromptForm prompt={selectedPrompt as Prompt} onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: knowledgeList } = useKnowledgeList();
  const createKnowledge = useCreateKnowledge();
  const updateKnowledge = useUpdateKnowledge();
  const deleteKnowledge = useDeleteKnowledge();
  const uploadKnowledge = useUploadKnowledge();

  const filteredKnowledge =
    knowledgeList?.data && knowledgeList?.data?.length > 0
      ? knowledgeList?.data?.filter(knowledge =>
          knowledge.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleCreateKnowledge = () => {
    setSelectedKnowledge(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditKnowledge = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
    setIsCreateDialogOpen(true);
  };

  const handleViewKnowledge = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (values.file) {
        // File upload
        await uploadKnowledge.mutateAsync({
          file: values.file,
          name: values.name,
        });
        toast({
          title: 'Knowledge uploaded',
          description: 'The file was successfully uploaded and processed.',
        });
      } else if (selectedKnowledge) {
        // Update existing knowledge
        await updateKnowledge.mutateAsync({
          knowledgeId: selectedKnowledge.id,
          data: values,
        });
        toast({
          title: 'Knowledge updated',
          description: 'The knowledge was successfully updated.',
        });
      } else {
        // Create new knowledge
        await createKnowledge.mutateAsync({
          data: values,
        });
        toast({
          title: 'Knowledge created',
          description: 'The knowledge was successfully created.',
        });
      }
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error saving knowledge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save knowledge.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (knowledge: Knowledge) => {
    try {
      await deleteKnowledge.mutateAsync({ knowledgeId: knowledge.id });
      toast({
        title: 'Knowledge deleted',
        description: 'The knowledge was successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="relative mb-8">
        <Input
          type="text"
          placeholder="Search knowledge..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2 transform" />
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-6 rounded-lg"
        >
          <h3 className="mb-4 font-semibold text-lg">Add Knowledge</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            Upload documents or add text to create a knowledge base for your AI to reference.
          </p>
          <Button className="gap-2 w-full" onClick={handleCreateKnowledge}>
            <Database className="size-4" />
            Add Knowledge
          </Button>
        </motion.div>

        {filteredKnowledge && filteredKnowledge?.length > 0 ? (
          filteredKnowledge?.map(knowledge => (
            <KnowledgeCard
              key={knowledge.id}
              knowledge={knowledge}
              onEdit={handleEditKnowledge}
              onDelete={() => handleDelete(knowledge)}
              onView={() => handleViewKnowledge(knowledge)}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center items-center bg-transparent p-6 border border-muted-foreground border-dashed rounded-lg"
          >
            <div className="flex flex-col justify-center items-center">
              <h3 className="mx-auto mb-4 font-semibold text-muted-foreground text-lg text-center">No knowledge found</h3>
              <div className="mx-auto mb-4 text-muted-foreground text-sm text-center">
                Upload documents or add text to create a knowledge base for your AI to reference.
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedKnowledge ? 'Edit Knowledge' : 'Add Knowledge'}</DialogTitle>
          </DialogHeader>
          <KnowledgeForm
            knowledge={selectedKnowledge as Knowledge}
            onSubmit={handleSubmit}
            isUploading={!selectedKnowledge}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Knowledge</DialogTitle>
          </DialogHeader>
          {selectedKnowledge && <KnowledgeViewer knowledge={selectedKnowledge} />}
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
      case 3:
        return <KnowledgeBase />;
      default:
        return null;
    }
  };

  return (
    <div className="scrollbar-hidden z-10 relative flex flex-col flex-auto justify-between pt-12 w-[100%] max-w-full h-0 overflow-auto">
      <div className="relative mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl h-full">
        <div className="flex flex-col h-full">
          <Head title="Workspace" description="Manage your AI workspace" />

          <div className="flex-1 overflow-auto">
            <div className="px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="font-bold text-4xl">Workspace</h1>
                  <p className="text-muted-foreground text-lg">
                    Fine-tune models, create functions, and manage prompts
                  </p>
                </div>
              </div>

              <div className="relative mb-8">
                {/* Hover Highlight */}
                <div
                  className="absolute flex items-center bg-secondary rounded-[6px] h-[30px] transition-all duration-300 ease-out"
                  style={{
                    ...hoverStyle,
                    opacity: hoveredIndex !== null ? 1 : 0,
                  }}
                />

                {/* Active Indicator */}
                <div
                  className="bottom-[-6px] absolute bg-primary rounded-full h-[2px] transition-all duration-300 ease-out"
                  style={activeStyle}
                />

                {/* Tabs */}
                <div className="relative flex items-center space-x-[6px]">
                  {tabs.map((tab, index) => (
                    <div
                      key={index}
                      ref={(el) => {
                        tabRefs.current[index] = el;
                        return undefined;
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                        index === activeIndex ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setActiveIndex(index)}
                    >
                      <div className="flex justify-center items-center gap-2 h-full font-medium text-sm leading-5 whitespace-nowrap">
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
