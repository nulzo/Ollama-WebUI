import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from '@/features/sidebar/components/sidebar-context';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="text-foreground bg-background font-inter selection:bg-primary/50 h-screen max-h-[100dvh] overflow-hidden flex">
      {/* Main Content Area */}
      <motion.main
        className="flex-1 relative w-full max-w-full flex flex-col overflow-auto"
        animate={{
          marginLeft: isCollapsed ? '55px' : '250px'
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut"
        }}
      >
        <div className="h-full w-full overflow-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
}