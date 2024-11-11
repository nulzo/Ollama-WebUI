import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from "@/components/ui/toaster"
import Sidebar from '@/components/element/sidebar.tsx';
import { AppLayout } from '@/components/layouts/main';
import { ConversationList } from '@/features/conversation/components/conversation-list';
export const AppRoot = () => {
  const location = useLocation();

  return (
    <>
      <Sidebar conversationList={<ConversationList />} />
      <AppLayout>
        <Suspense
          fallback={
            <div className="flex size-full items-center justify-center">
              <Spinner size="xl" />
            </div>
          }
        >
          <ErrorBoundary key={location.pathname} fallback={<div>Something went wrong!</div>}>
            <Outlet />
          </ErrorBoundary>
        </Suspense>
      </AppLayout>
      <Toaster />
    </>
  );
};
