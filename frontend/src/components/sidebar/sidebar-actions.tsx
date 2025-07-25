import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, ArrowUpDown, Bot, Code2, ChevronRight, LayoutGrid, Image, Box, Spline, AreaChart, Database } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTools } from '@/features/tools/api';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible.tsx';
import { LucideIcon } from 'lucide-react';

interface SidebarActionsProps {
  isCollapsed: boolean;
  animationDuration: number;
}

interface SidebarDropdownButtonProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  animationDuration: number;
}

interface SidebarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isCollapsed: boolean;
  animationDuration: number;
  variant?: 'default' | 'ghost' | 'secondary';
}

export const SidebarDropdownButton = ({
  icon: Icon,
  label,
  children,
  isCollapsed,
  animationDuration,
}: SidebarDropdownButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm"
        >
          <div className="left-3 absolute flex justify-between items-center w-[calc(100%-24px)]">
            <div className="flex items-center">
              <Icon className="size-4" />
              <motion.span
                className="ml-2 overflow-hidden text-sm whitespace-nowrap"
                animate={{
                  width: isCollapsed ? 0 : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{
                  duration: animationDuration,
                  ease: 'easeInOut',
                }}
              >
                {label}
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
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </motion.div>
          </div>
        </Button>
      </CollapsibleTrigger>

      {!isCollapsed && (
        <CollapsibleContent>
          <motion.div
            initial="closed"
            animate={isExpanded ? 'open' : 'closed'}
            variants={slideAnimation}
          >
            <div className="relative ml-5 pl-2 border-l">{children}</div>
          </motion.div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export const SidebarButton = ({
  icon: Icon,
  label,
  onClick,
  isCollapsed,
  animationDuration,
  variant = 'ghost',
}: SidebarButtonProps) => {
  return (
    <Button
      variant={variant}
      size="icon"
      className="group text-muted-foreground hover:text-foreground relative flex justify-start gap-2.5 w-full h-9 font-normal text-sm"
      onClick={onClick}
    >
      <div className="left-3 absolute flex items-center">
        <Icon className="size-4 shrink-0" />
        {!isCollapsed && (
          <motion.span
            className="ml-2 overflow-hidden text-sm whitespace-nowrap"
            animate={{
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{
              duration: animationDuration,
              ease: 'easeInOut',
            }}
          >
            {label}
          </motion.span>
        )}
      </div>
    </Button>
  );
};

const slideAnimation = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        type: 'spring',
        bounce: 0,
        duration: 0.3,
      },
      opacity: {
        duration: 0.3,
      },
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        type: 'spring',
        bounce: 0,
        duration: 0.3,
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
};

// Search component
const SearchBar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  if (isCollapsed) return null;

  return (
    <div className="flex items-center gap-2.5 px-3 w-full">
      <MagnifyingGlassIcon className="stroke-muted-foreground size-4" />
      <Input
        className="bg-transparent px-0 border-0 focus-within:border-0 focus:border-0 focus:outline-hidden hover:ring-0 focus-visible:ring-0 focus-within:ring-0 focus:ring-0 w-[75%]"
        placeholder="Search"
      />
    </div>
  );
};

// Main SidebarActions component
export const SidebarActions = ({ isCollapsed, animationDuration }: SidebarActionsProps) => {
  const navigate = useNavigate();
  const { data: tools } = useTools();

  return (
    <div className="p-2">
      <div className="mb-2">
      <Button
      variant="badge"
      size="icon"
      className="group relative flex justify-start gap-2.5 w-full h-9 font-bold text-sm"
      onClick={() => navigate("/")}
    >
      <div className="left-3 absolute flex items-center">
        {!isCollapsed && (
          <motion.span
            className="ml-2 overflow-hidden text-sm whitespace-nowrap"
            animate={{
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{
              duration: animationDuration,
              ease: 'easeInOut',
            }}
          >
            Chat
          </motion.span>
        )}
        {isCollapsed && (
          <motion.span
            className="overflow-hidden whitespace-nowrap"
            transition={{
              duration: animationDuration,
              ease: 'easeInOut',
            }}
          >
            <Plus className="size-4 shrink-0" />
          </motion.span>
        )}
      </div>
    </Button>
      </div>

      <SidebarButton
        icon={ArrowUpDown}
        label="Download Models"
        onClick={() => navigate('/models/download')}
        isCollapsed={isCollapsed}
        animationDuration={animationDuration}
      />

      <SidebarButton
        icon={Box}
        label="Workspace"
        onClick={() => navigate('/workspace')}
        isCollapsed={isCollapsed}
        animationDuration={animationDuration}
      />

      <SidebarButton
        icon={Database}
        label="Knowledge Base"
        onClick={() => navigate('/knowledge')}
        isCollapsed={isCollapsed}
        animationDuration={animationDuration}
      />

      <SidebarButton
        icon={AreaChart}
        label="Analytics"
        onClick={() => navigate('/analytics')}
        isCollapsed={isCollapsed}
        animationDuration={animationDuration}
      />

      {/* <SidebarDropdownButton
        icon={Bot}
        label="Fine-Tune Agents"
        isCollapsed={isCollapsed}
        animationDuration={animationDuration}
      >
        <AgentsList mockAgents={mockAgents} navigate={navigate} isCollapsed={isCollapsed} />
      </SidebarDropdownButton>

      <SidebarDropdownButton
        icon={Code2}
        label="Functions"
        isCollapsed={isCollapsed}
        animationDuration={animationDuration}
      >
        <FunctionsList tools={tools} navigate={navigate} isCollapsed={isCollapsed} />
      </SidebarDropdownButton> */}

      <SearchBar isCollapsed={isCollapsed} />
    </div>
  );
};

// Helper components for the lists
const AgentsList = ({ mockAgents, navigate, isCollapsed }: any) => (
  <>
    <Button
      variant="ghost"
      size="sm"
      className="group relative flex justify-start items-center pl-2 w-full h-8 text-sm"
      onClick={() => navigate('/agents')}
    >
      <motion.div className="flex items-center gap-2 text-primary hover:text-primary/80">
        <Plus className="size-3 shrink-0" />
        <span className="font-medium text-xs">Create New Agent</span>
      </motion.div>
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="group relative flex justify-start items-center pl-2 w-full h-8 text-sm"
      onClick={() => navigate('/agents')}
    >
      <motion.div className="group-hover:text-foreground flex items-center gap-2 text-muted-foreground">
        <LayoutGrid className="size-3 shrink-0" />
        <span className="text-xs">View All Agents</span>
      </motion.div>
    </Button>

    {mockAgents.map((agent: any) => (
      <Button
        key={agent.id}
        variant="ghost"
        size="sm"
        className="group relative flex justify-start items-center pl-2 w-full h-8 text-sm"
      >
        <motion.div
          className="group-hover:text-foreground flex items-center gap-2 text-muted-foreground"
          animate={{
            width: isCollapsed ? 0 : 'auto',
            opacity: isCollapsed ? 0 : 1,
          }}
        >
          <agent.icon className="size-3 shrink-0" />
          <span className="text-xs">{agent.name}</span>
        </motion.div>
      </Button>
    ))}
  </>
);

const FunctionsList = ({ tools, navigate, isCollapsed }: any) => (
  <>
    <Button
      variant="ghost"
      size="sm"
      className="group relative flex justify-start items-center pl-2 w-full h-8 text-sm"
      onClick={() => navigate('/tools/new')}
    >
      <motion.div
        className="flex items-center gap-2 text-primary hover:text-primary/80"
        animate={{
          width: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <Plus className="size-3 shrink-0" />
        <span className="font-medium text-xs">Create New Function</span>
      </motion.div>
    </Button>

    <Button
      variant="ghost"
      size="sm"
      className="group relative flex justify-start items-center pl-2 w-full h-8 text-sm"
      onClick={() => navigate('/tools')}
    >
      <motion.div className="group-hover:text-foreground flex items-center gap-2 text-muted-foreground">
        <LayoutGrid className="size-3 shrink-0" />
        <span className="text-xs">View All Functions</span>
      </motion.div>
    </Button>

    {tools?.results?.map((tool: any) => (
      <Button
        key={tool.id}
        variant="ghost"
        size="sm"
        className="group relative flex justify-start items-center pl-2 w-full h-8 text-sm"
        onClick={() => navigate(`/tools/${tool.id}`)}
      >
        <motion.div className="group-hover:text-foreground flex items-center gap-2 font-geistmono text-muted-foreground">
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
