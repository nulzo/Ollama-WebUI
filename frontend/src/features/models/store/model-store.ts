import { OllamaModel } from '@/types/models';
import { create } from 'zustand';

type ModelStore = {
    model: OllamaModel | null;
    setModel: (model: Omit<OllamaModel, 'id'>) => void;
};

export const useModelStore = create<ModelStore>((set) => ({
    model: null,
    setModel: (model) => set(() => ({ model })),
}));
