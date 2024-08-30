import { ollama } from '@/services/provider/ollama';
import { Model } from '@/types/models';
import { create, createStore } from 'zustand';

interface ModelState {
    models: Model[];
    selectedModel: Model | null;
    loading: boolean;
    error: string | null;
    fetchModels: () => Promise<void>;
    setSelectedModel: (model: Model | null) => void;
}

export const useModelStore = createStore<ModelState>((set) => ({
    models: [],
    selectedModel: null,
    loading: false,
    error: null,
    fetchModels: async () => {
        set({ loading: true, error: null });
        try {
            const models = await ollama.list();
            set({ models, loading: false });
        } catch (error) {
            let errorMessage = 'An unexpected error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            set({ error: errorMessage, loading: false });
        }
    },
    setSelectedModel: (model) => set({ selectedModel: model }),
}));
