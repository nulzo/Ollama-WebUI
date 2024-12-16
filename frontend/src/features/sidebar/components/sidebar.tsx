import { motion, useMotionValue } from 'framer-motion';
import { SidebarHeader } from '@/features/sidebar/components/sidebar-header';
import { SidebarActions } from '@/features/sidebar/components/sidebar-actions';
import { SidebarConversationList } from '@/features/sidebar/components/sidebar-conversation-list';
import { SidebarUserSection } from '@/features/sidebar/components/sidebar-user-section';
import { SidebarModals } from '@/features/sidebar/components/sidebar-modals';
import { useSidebar } from '@/features/sidebar/components/sidebar-context';

interface SidebarProps {
  conversationList?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Sidebar = ({ conversationList }: SidebarProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const animationDuration = 0.2;

  const MIN_WIDTH = 57;
  const MAX_WIDTH = 250;
  const width = useMotionValue(isCollapsed ? MIN_WIDTH : MAX_WIDTH);

  return (
    <motion.div
      className="left-0 z-[1] fixed inset-y-0 sidebar-container"
      initial={false}
      animate={{
        width: isCollapsed ? MIN_WIDTH : MAX_WIDTH,
      }}
      style={{ width }}
      transition={{
        duration: animationDuration,
        ease: 'easeInOut',
      }}
    >
      <div className="relative flex flex-col bg-secondary border-r h-svh overflow-hidden">
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          animationDuration={animationDuration}
        />

        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <SidebarActions isCollapsed={isCollapsed} animationDuration={animationDuration} />

          <SidebarConversationList isCollapsed={isCollapsed} conversationList={conversationList} />

          <SidebarUserSection isCollapsed={isCollapsed} animationDuration={animationDuration} />
        </div>
      </div>

      <SidebarModals />
    </motion.div>
  );
};
