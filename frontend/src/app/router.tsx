import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppRoot } from '@/app/routes/app/root.tsx';
import { ProtectedRoute } from '@/lib/auth';
import { ToolEditor } from '@/features/tools/components/tools-editor';
import { ToolsList } from '@/features/tools/components/tools-list';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createAppRouter = (_queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: 'login',
      lazy: async () => {
        const { LoginRoute } = await import('@/app/routes/auth/login');
        return { Component: LoginRoute };
      },
    },
    {
      path: 'register',
      lazy: async () => {
        const { RegisterRoute } = await import('@/app/routes/auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: 'logout',
      lazy: async () => {
        const { LogoutRoute } = await import('@/app/routes/auth/logout');
        return { Component: LogoutRoute };
      },
    },
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
            const ChatPage = await import('@/app/routes/app/chat/chat');
            return { Component: ChatPage.default };
          },
        },
        {
          path: 'agents',
          lazy: async () => {
            const { AgentsRoute } = await import('@/app/routes/app/agents');
            return { Component: AgentsRoute };
          },
        },
        {
          path: 'settings',
          lazy: async () => {
            const { SettingsRoute } = await import('@/app/routes/app/settings');
            return { Component: SettingsRoute };
          },
        },
        {
          path: 'cloud',
          lazy: async () => {
            const { CloudRoute } = await import('@/app/routes/app/cloud');
            return { Component: CloudRoute };
          },
        },
        {
          path: 'workspace',
          lazy: async () => {
            const { WorkspaceRoute } = await import('@/app/routes/app/workspace');
            return { Component: WorkspaceRoute };
          },
        },
        {
          path: 'knowledge',
          lazy: async () => {
            const KnowledgePage = await import('@/app/routes/app/knowledge');
            return { Component: KnowledgePage.default };
          },
        },
        {
          path: 'tools',
          children: [
            {
              path: '',
              element: <ToolsList />,
            },
            {
              path: 'new',
              lazy: async () => {
                const { ToolsRoute } = await import('@/app/routes/app/tools');
                return { Component: ToolsRoute };
              },
            },
            {
              path: ':toolId',
              element: <ToolEditor />,
            },
          ],
        },
        {
          path: 'analytics',
          lazy: async () => {
            const { AnalyticsRoute } = await import('@/app/routes/app/analytics');
            return { Component: AnalyticsRoute };
          },
        },
        {
          path: 'diffusion',
          lazy: async () => {
            const { DiffusionRoute } = await import('@/app/routes/app/diffusion');
            return { Component: DiffusionRoute };
          },
        },
        {
          path: '',
          lazy: async () => {
            const ChatPage = await import('@/app/routes/app/chat/chat');
            return { Component: ChatPage.default };
          },
        },
      ],
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
