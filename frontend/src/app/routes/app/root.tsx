// frontend/src/app/routes/app/root.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/features/sidebar/components/sidebar';
import { AppLayout } from '@/components/layouts/main';
import { ConversationList } from '@/features/chat/components/message-list/conversation-list.tsx';

export const AppRoot = () => {
  const location = useLocation();

  return (
    <>
      <Sidebar conversationList={<ConversationList />} />
      <AppLayout>
        <Suspense
          fallback={
            <div className="flex justify-center items-center size-full">
              <Spinner size="xl" />
            </div>
          }
        >
          <ErrorBoundary key={location.pathname} fallback={<div>Something went wrong!</div>}>
            <Outlet />
            <Toaster />
          </ErrorBoundary>
        </Suspense>
      </AppLayout>
    </>
  );
};
