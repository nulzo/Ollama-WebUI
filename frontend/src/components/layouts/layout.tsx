import { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar/sidebar';
import { ConversationList } from '@/features/chat/components/message-list/conversation-list';
import { useSidebar } from '../sidebar/sidebar-context';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen max-h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar conversationList={<ConversationList />} />
      
      {/* Main Content */}
      <main 
        className="relative z-0 py-3 pl-1 pr-3 flex flex-col bg-secondary flex-1 w-full max-w-full"
        style={{
          marginLeft: isCollapsed ? '55px' : '250px',
          transition: 'margin-left 0.2s ease-in-out',
        }}
      >
        <div className="flex rounded-xl flex-col h-full overflow-hidden bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}