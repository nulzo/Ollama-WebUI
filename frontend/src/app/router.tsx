import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppRoot } from '@/app/routes/app/root.tsx';
import { ProtectedRoute } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createAppRouter = (_queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'chat',
          lazy: async () => {
            const { ChatRoute } = await import('@/app/routes/app/chat');
            return { Component: ChatRoute };
          },
        },
        {
          path: 'models',
          lazy: async () => {
            const { ModelsRoute } = await import('@/app/routes/app/models');
            return { Component: ModelsRoute };
          },
        },
        {
          path: '',
          lazy: async () => {
            const { ChatRoute } = await import('@/app/routes/app/chat');
            return { Component: ChatRoute };
          },
        },
      ],
    },
    {
      path: 'login',
      lazy: async () => {
        const { LoginRoute } = await import('@/app/routes/auth/login');
        return { Component: LoginRoute };
      },
    },
    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('@/app/routes/error/not-found.tsx');
        return { Component: NotFoundRoute };
      },
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();
  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
  return <RouterProvider router={router} />;
};
