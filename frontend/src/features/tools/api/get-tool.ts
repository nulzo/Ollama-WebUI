import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Tool } from '@/features/tools/types/tool';
import { ApiResponse } from '@/types/api';

export const getTool = async ({ toolId }: { toolId: string }): Promise<Tool> => {
    const response = await api.get<ApiResponse<Tool>>(`/tools/${toolId}/`);
    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch tool');
    }
    return response.data;
};

export const getToolQueryOptions = ({ toolId }: { toolId: string }) => ({
    queryKey: ['tools', toolId],
    queryFn: () => getTool({ toolId }),
});

export const useTool = ({ toolId }: { toolId: string }) => {
    return useQuery(getToolQueryOptions({ toolId }));
};