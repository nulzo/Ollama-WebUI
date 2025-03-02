import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Knowledge } from '../knowledge';
import { getKnowledgeListQueryOptions } from './get-knowledge-list';

export type UploadKnowledgeInput = {
  file: File;
  name?: string;
};

export const uploadKnowledge = async ({ file, name }: UploadKnowledgeInput): Promise<Knowledge> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (name) {
    formData.append('name', name);
  } else {
    formData.append('name', file.name);
  }
  
  // Generate a unique identifier based on the file name and timestamp
  const identifier = `${file.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
  formData.append('identifier', identifier);

  // Don't set any headers - let the API client handle it
  return api.post('/knowledge/upload/', formData);
};

type UseUploadKnowledgeOptions = {
  mutationConfig?: MutationConfig<typeof uploadKnowledge>;
};

export const useUploadKnowledge = ({ mutationConfig }: UseUploadKnowledgeOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getKnowledgeListQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: uploadKnowledge,
  });
}; 