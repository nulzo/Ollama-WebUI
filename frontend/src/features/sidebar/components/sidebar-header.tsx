import { motion } from 'framer-motion';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CringeLogo } from '@/assets/cringelogo';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  animationDuration: number;
}

export const SidebarHeader = ({ isCollapsed, toggleSidebar, animationDuration }: SidebarHeaderProps) => {
  return (
    <div className="relative flex items-center mt-2 p-2 pb-1 h-12 align-middle">
      <span className="flex items-center gap-1 px-1 w-full font-semibold text-foreground text-lg">
        {/* Logo when expanded */}
        <motion.div
          className="left-4 absolute"
          animate={{
            opacity: isCollapsed ? 0 : 1,
          }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
          }}
        >
          <CringeLogo className="select-none shrink-0 size-6 stroke-foreground" />
        </motion.div>

        {/* Collapse button when collapsed */}
        <motion.div
          className="left-2 absolute w-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isCollapsed ? 1 : 0,
          }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
            delay: isCollapsed ? animationDuration : 0,
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="relative flex justify-center items-center w-10 h-9 font-bold text-sm group"
          >
            <PanelRightClose className="size-4 stroke-foreground" />
          </Button>
        </motion.div>

        {/* Title and expand button when expanded */}
        <div className="flex justify-between items-center gap-1 ml-8 w-full">
          <motion.div
            className="flex items-center gap-1 text-foreground text-nowrap overflow-hidden select-none"
            animate={{
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{
              duration: animationDuration,
              ease: 'easeInOut',
            }}
          >
            CringeAI
            <span className="font-light text-primary text-xs">beta</span>
          </motion.div>

          <motion.div
            animate={{
              opacity: isCollapsed ? 0 : 1,
            }}
            transition={{
              duration: animationDuration,
              ease: 'easeInOut',
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="relative flex justify-center items-center w-10 h-9 font-bold text-sm group"
            >
              <PanelRightOpen className="size-4 stroke-foreground" />
            </Button>
          </motion.div>
        </div>
      </span>
    </div>
  );
};
