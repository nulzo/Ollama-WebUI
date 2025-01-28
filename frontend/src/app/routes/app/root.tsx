import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { AppLayout } from '@/components/layouts/layout';

export const AppRoot = () => {
  const location = useLocation();

  return (
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
        </ErrorBoundary>
      </Suspense>
    </AppLayout>
  );
};