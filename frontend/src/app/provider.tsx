import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/theme/theme-provider.tsx';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/error-fallback.tsx';
import { Notifications } from '@/components/notification/notification';
import { Spinner } from '@/components/ui/spinner';
import { queryConfig } from '@/lib/query';
import { AuthProvider } from '@/features/authentication/components/auth-provider';
import { ToastProvider } from '@/components/ui/toast';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      })
  );

  return (
    <ThemeProvider
      defaultTheme="dark"
      defaultColor="default"
      storageKeyColor="vite-ui-color"
      storageKeyTheme="vite-ui-theme"
    >
      <React.Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center">
            <Spinner size="xl" />
          </div>
        }
      >
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
          <ToastProvider>
            <HelmetProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  {import.meta.env.DEV && <ReactQueryDevtools />}
                  {children}
                  <Notifications />
                </AuthProvider>
              </QueryClientProvider>
            </HelmetProvider>
          </ToastProvider>
        </ErrorBoundary>
      </React.Suspense>
    </ThemeProvider>
  );
};
