import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {ThemeProvider} from "@/components/theme/theme-provider.tsx";
import * as React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {HelmetProvider} from 'react-helmet-async';

import {MainErrorFallback} from '@/components/errors/main';
import {Notifications} from '@/components/notification/notification';
import {Spinner} from '@/components/ui/spinner';
import {queryConfig} from '@/lib/query';

type AppProviderProps = {
    children: React.ReactNode;
};

export const AppProvider = ({children}: AppProviderProps) => {
    const [queryClient] = React.useState(
        () =>
            new QueryClient({
                defaultOptions: queryConfig,
            }),
    );

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <React.Suspense
                fallback={
                    <div className="flex h-screen w-screen items-center justify-center">
                        <Spinner size="xl"/>
                    </div>
                }
            >
                <ErrorBoundary FallbackComponent={MainErrorFallback}>
                    <HelmetProvider>
                        <QueryClientProvider client={queryClient}>
                            {import.meta.env.DEV && <ReactQueryDevtools/>}
                            <Notifications/>
                            {children}
                        </QueryClientProvider>
                    </HelmetProvider>
                </ErrorBoundary>
            </React.Suspense>
        </ThemeProvider>
    );
};