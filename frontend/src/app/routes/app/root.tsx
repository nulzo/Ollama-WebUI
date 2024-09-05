import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import Sidebar from '@/components/element/sidebar.tsx';

export const AppRoot = () => {
  const location = useLocation();
  return (
    <div className="font-inter selection:bg-primary/50 h-screen max-h-[100dvh] overflow-auto flex flex-row">
      <Suspense
        fallback={
          <div className="flex size-full items-center justify-center">
            <Spinner size="xl" />
          </div>
        }
      >
        <ErrorBoundary
          key={location.pathname}
          fallback={<div>Something went wrong!</div>}
        >
          <Sidebar />
          <Outlet />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};
