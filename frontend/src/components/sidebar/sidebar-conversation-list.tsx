import { motion } from 'framer-motion';
import { ConversationItem } from '@/components/sidebar/convertsation-item.tsx';
import { useConversations } from '@/features/chat/api/get-conversations.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';

interface SidebarConversationListProps {
  isCollapsed: boolean;
  conversationList?: React.ReactNode;
}

export const SidebarConversationList = ({
  isCollapsed,
  conversationList,
}: SidebarConversationListProps) => {
  const { data: conversations, isLoading } = useConversations();

  if (conversationList) {
    return (
      <motion.div
        className="flex-1 overflow-y-auto min-h-0 p-2"
        animate={{
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
      >
        {conversationList}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex-1 overflow-y-auto min-h-0 p-2"
      animate={{
        opacity: isCollapsed ? 0 : 1,
      }}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
    >
      {isLoading ? (
        <ConversationListSkeleton />
      ) : (
        <div className="space-y-1">
          {conversations?.map(conversation => (
            <ConversationItem
              key={conversation.uuid}
              conversation={conversation}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ConversationListSkeleton = () => {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
};
