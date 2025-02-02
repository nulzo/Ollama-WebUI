import { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar/sidebar';
import { ConversationList } from '@/features/chat/components/message-list/conversation-list';
import { useSidebar } from '../sidebar/sidebar-context';
import { useErrorStore } from '../errors/error-store';
import { ErrorDialog } from '../errors/error-dialog';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { isOpen, error, hideError } = useErrorStore();

  return (
    <div className="flex h-screen max-h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar conversationList={<ConversationList />} />
      
      {/* Main Content */}
      <main 
        className="relative z-0 flex flex-col flex-1 bg-secondary py-4 pr-4 pl-1 w-full max-w-full"
        style={{
          marginLeft: isCollapsed ? '55px' : '250px',
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        <div className="flex flex-col bg-background rounded-xl h-full overflow-hidden">
          {children}
        </div>
        <ErrorDialog 
          open={isOpen}
          onOpenChange={(open: boolean) => !open && hideError()}
          error={error || {}}
        />
      </main>
    </div>
  );
}