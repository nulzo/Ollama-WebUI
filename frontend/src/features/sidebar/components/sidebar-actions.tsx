import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, ArrowUpDown, Bot, Code2, ChevronRight, LayoutGrid, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTools } from '@/features/tools/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarActionsProps {
  isCollapsed: boolean;
  animationDuration: number;
}

// Subcomponent for the New Chat button
const NewChatButton = ({ isCollapsed, animationDuration }: SidebarActionsProps) => {
  const navigate = useNavigate();

  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative flex justify-center gap-2.5 mb-2 w-full h-9 font-bold text-center text-sm group"
        onClick={() => navigate('/')}
      >
        <div className="left-3 absolute flex justify-center items-center">
          <Plus className="shrink-0 size-4" />
        </div>
      </Button>
    );
  }

  return (
    <div className="flex justify-center items-center w-full">
      <Button
        variant="default"
        size="icon"
        className="relative flex justify-center items-center gap-2.5 mb-2 px-2 w-full h-9 font-bold text-sm group"
        onClick={() => navigate('/')}
      >
        <div className="flex justify-center items-center">
          <motion.span
            className="ml-2 text-sm whitespace-nowrap overflow-hidden"
            animate={{
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{
              duration: animationDuration,
              ease: 'easeInOut',
            }}
          >
            New Chat
          </motion.span>
        </div>
      </Button>
    </div>
  );
};

// Subcomponent for the Models button
const ModelsButton = ({ isCollapsed, animationDuration }: SidebarActionsProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm group"
      onClick={() => navigate('/cloud')}
    >
      <div className="left-3 absolute flex items-center">
        <ArrowUpDown className="size-4" />
        <motion.span
          className="ml-2 text-sm whitespace-nowrap overflow-hidden"
          animate={{
            width: isCollapsed ? 0 : 'auto',
            opacity: isCollapsed ? 0 : 1,
          }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
          }}
        >
          Download Models
        </motion.span>
      </div>
    </Button>
  );
};

// Subcomponent for the Agents section
const AgentsSection = ({ isCollapsed, animationDuration }: SidebarActionsProps) => {
  const [isAgentsExpanded, setIsAgentsExpanded] = useState(false);
  const navigate = useNavigate();

  const mockAgents = [
    { id: '1', name: 'Code Assistant', model: 'codellama', icon: Code2 },
    { id: '2', name: 'Writing Helper', model: 'mistral', icon: Image },
    { id: '3', name: 'Image Expert', model: 'llama2', icon: Image },
  ];

  return (
    <Collapsible open={isAgentsExpanded} onOpenChange={setIsAgentsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm group"
        >
          <div className="left-3 absolute flex items-center justify-between w-[calc(100%-24px)]">
            <div className="flex items-center">
              <Bot className="size-4" />
              <motion.span
                className="ml-2 text-sm whitespace-nowrap overflow-hidden"
                animate={{
                  width: isCollapsed ? 0 : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{
                  duration: animationDuration,
                  ease: 'easeInOut',
                }}
              >
                Fine-Tune Agents
              </motion.span>
            </div>
            <motion.div
              animate={{
                width: isCollapsed ? 0 : 'auto',
                opacity: isCollapsed ? 0 : 1,
              }}
              transition={{
                duration: animationDuration,
                ease: 'easeInOut',
              }}
            >
              <ChevronRight
                className={`size-3 transition-transform duration-200 ${
                  isAgentsExpanded ? 'rotate-90' : ''
                }`}
              />
            </motion.div>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {!isCollapsed && (
          <div className="relative pl-8 border-l border-primary/20 ml-4">
            <AgentsList mockAgents={mockAgents} navigate={navigate} />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Subcomponent for the Functions section
const FunctionsSection = ({ isCollapsed, animationDuration }: SidebarActionsProps) => {
  const [isFunctionsExpanded, setIsFunctionsExpanded] = useState(false);
  const navigate = useNavigate();
  const { data: tools } = useTools();

  return (
    <Collapsible open={isFunctionsExpanded} onOpenChange={setIsFunctionsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm group"
        >
          <div className="left-3 absolute flex items-center justify-between w-[calc(100%-24px)]">
            <div className="flex items-center">
              <Code2 className="size-4" />
              <motion.span
                className="ml-2 text-sm whitespace-nowrap overflow-hidden"
                animate={{
                  width: isCollapsed ? 0 : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{
                  duration: animationDuration,
                  ease: 'easeInOut',
                }}
              >
                Functions
              </motion.span>
            </div>
            <motion.div
              animate={{
                width: isCollapsed ? 0 : 'auto',
                opacity: isCollapsed ? 0 : 1,
              }}
              transition={{
                duration: animationDuration,
                ease: 'easeInOut',
              }}
            >
              <ChevronRight
                className={`size-3 transition-transform duration-200 ${
                  isFunctionsExpanded ? 'rotate-90' : ''
                }`}
              />
            </motion.div>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {!isCollapsed && (
          <div className="relative pl-2 border-l border-muted ml-4">
            <FunctionsList tools={tools} navigate={navigate} />
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// Search component
const SearchBar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  if (isCollapsed) return null;

  return (
    <div className="flex items-center px-3 gap-2.5 w-full">
      <MagnifyingGlassIcon className="size-4 stroke-muted-foreground" />
      <Input
        className="border-0 focus-within:border-0 focus:border-0 bg-transparent px-0 hover:ring-0 focus-visible:ring-0 focus-within:ring-0 focus:ring-0 w-[75%] focus:outline-none"
        placeholder="Search"
      />
    </div>
  );
};

// Main SidebarActions component
export const SidebarActions = ({ isCollapsed, animationDuration }: SidebarActionsProps) => {
  return (
    <div className="p-2">
      <NewChatButton isCollapsed={isCollapsed} animationDuration={animationDuration} />
      <ModelsButton isCollapsed={isCollapsed} animationDuration={animationDuration} />
      <AgentsSection isCollapsed={isCollapsed} animationDuration={animationDuration} />
      <FunctionsSection isCollapsed={isCollapsed} animationDuration={animationDuration} />
      <SearchBar isCollapsed={isCollapsed} />
    </div>
  );
};

// Helper components for the lists
const AgentsList = ({ mockAgents, navigate }) => (
  <>
    <Button
      variant="ghost"
      size="sm"
      className="relative flex justify-start items-center w-full h-8 pl-2 text-sm group"
      onClick={() => navigate('/agents')}
    >
      <motion.div className="flex items-center gap-2 text-primary hover:text-primary/80">
        <Plus className="size-3 shrink-0" />
        <span className="text-xs font-medium">Create New Agent</span>
      </motion.div>
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="relative flex justify-start items-center w-full h-8 pl-2 text-sm group"
      onClick={() => navigate('/agents')}
    >
      <motion.div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
        <LayoutGrid className="size-3 shrink-0" />
        <span className="text-xs">View All Agents</span>
      </motion.div>
    </Button>

    {mockAgents.map(agent => (
      <Button
        key={agent.id}
        variant="ghost"
        size="sm"
        className="relative flex justify-start items-center w-full h-8 pl-2 text-sm group"
      >
        <motion.div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
          <agent.icon className="size-3 shrink-0" />
          <span className="text-xs">{agent.name}</span>
        </motion.div>
      </Button>
    ))}
  </>
);

const FunctionsList = ({ tools, navigate }) => (
  <>
    <Button
      variant="ghost"
      size="sm"
      className="relative flex justify-start items-center w-full h-8 pl-2 text-sm group"
      onClick={() => navigate('/tools/new')}
    >
      <motion.div className="flex items-center gap-2 text-primary hover:text-primary/80">
        <Plus className="size-3 shrink-0" />
        <span className="text-xs font-medium">Create New Function</span>
      </motion.div>
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="relative flex justify-start items-center w-full h-8 pl-2 text-sm group"
      onClick={() => navigate('/tools')}
    >
      <motion.div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
        <LayoutGrid className="size-3 shrink-0" />
        <span className="text-xs">View All Functions</span>
      </motion.div>
    </Button>

    {tools?.results?.map(tool => (
      <Button
        key={tool.id}
        variant="ghost"
        size="sm"
        className="relative flex justify-start items-center w-full h-8 pl-2 text-sm group"
        onClick={() => navigate(`/tools/${tool.id}`)}
      >
        <motion.div className="flex items-center gap-2 font-mono text-muted-foreground group-hover:text-foreground">
          <Code2 className="size-3 shrink-0" />
          <span className="text-xs">
            {tool.name}
            <span className="text-primary/40">()</span>
          </span>
        </motion.div>
      </Button>
    ))}
  </>
);
