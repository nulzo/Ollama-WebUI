import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/theme/theme-provider.tsx';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { MainErrorFallback } from '@/components/errors/error-fallback.tsx';
import { Notifications } from '@/components/notification/notification';
import { Spinner } from '@/components/ui/spinner';
import { queryConfig } from '@/lib/query';
import { AuthProvider } from '@/features/authentication/components/auth-provider';
import { SidebarProvider } from '@/features/sidebar/components/sidebar-context';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const queryClient = new QueryClient({ defaultOptions: queryConfig });

  return (
    <ThemeProvider
      defaultTheme="dark"
      defaultColor="default"
      storageKeyColor="vite-ui-color"
      storageKeyTheme="vite-ui-theme"
    >
      <React.Suspense
        fallback={
          <div className="flex justify-center items-center w-screen h-screen">
            <Spinner size="md" />
          </div>
        }
      >
        <SidebarProvider>
          <ErrorBoundary FallbackComponent={MainErrorFallback}>
            <HelmetProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  {import.meta.env.DEV && <ReactQueryDevtools />}
                  {children}
                  <Toaster />
                  <Notifications />
                </AuthProvider>
              </QueryClientProvider>
            </HelmetProvider>
          </ErrorBoundary>
        </SidebarProvider>
      </React.Suspense>
    </ThemeProvider>
  );
};
