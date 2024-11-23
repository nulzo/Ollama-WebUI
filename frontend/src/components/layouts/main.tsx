import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSidebar } from '@/features/sidebar/components/sidebar-context';
import { Toaster } from "@/components/ui/sonner"

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex bg-background selection:bg-primary/50 h-screen max-h-[100dvh] font-inter text-foreground overflow-hidden">
      {/* Main Content Area */}
      <div
        className="relative flex flex-col flex-1 w-full max-w-full overflow-auto"
        style={{
          marginLeft: isCollapsed ? '55px' : '250px',
          transition: 'margin-left 0.2s ease-in-out'
        }}
      >
        <div className="w-full h-full overflow-auto">
          {children}
          <Toaster />
        </div>
      </div>
    </div>
  );
}