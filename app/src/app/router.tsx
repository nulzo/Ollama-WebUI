import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
    LoaderFunctionArgs,
    RouterProvider,
    createBrowserRouter,
} from 'react-router-dom';
import {AppRoot} from "@/app/routes/app/root.tsx";


export const createAppRouter = (queryClient: QueryClient) =>
    createBrowserRouter([
        {
            path: '/',
            element: (
                <AppRoot />
            ),
            children: [
                {
                    path: 'chat',
                    lazy: async () => {
                        const { ChatRoute } = await import('@/app/routes/app/chat');
                        return { Component: ChatRoute };
                    },
                    // loader: async (args: LoaderFunctionArgs) => {
                    //     const { discussionsLoader } = await import(
                    //         './routes/app/discussions/discussions'
                    //         );
                    //     return discussionsLoader(queryClient)(args);
                    // },
                },
                {
                    path: 'models',
                    lazy: async () => {
                        const { ModelsRoute } = await import('@/app/routes/app/models');
                        return { Component: ModelsRoute };
                    },
                    // loader: async (args: LoaderFunctionArgs) => {
                    //     const { discussionsLoader } = await import(
                    //         './routes/app/discussions/discussions'
                    //         );
                    //     return discussionsLoader(queryClient)(args);
                    // },
                },
                // {
                //     path: 'discussions/:discussionId',
                //     lazy: async () => {
                //         const { DiscussionRoute } = await import(
                //             './routes/app/discussions/discussion'
                //             );
                //         return { Component: DiscussionRoute };
                //     },
                //
                //     loader: async (args: LoaderFunctionArgs) => {
                //         const { discussionLoader } = await import(
                //             './routes/app/discussions/discussion'
                //             );
                //         return discussionLoader(queryClient)(args);
                //     },
                // },
                {
                    path: '',
                    lazy: async () => {
                        const { ChatPage } = await import('@/routes/chat-page');
                        return { Component: ChatPage };
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