import { create } from 'zustand';

// Updated model type to include the provider field
export interface Model {
  id?: string;
  name: string;
  provider: string; // new field added for provider name
}

type ModelStore = {
  model: Model | null;
  setModel: (model: Omit<Model, 'id'>) => void;
  provider: string | null;
  setProvider: (provider: string) => void;
};

export const useModelStore = create<ModelStore>(set => ({
  model: null,
  provider: null,
  setModel: model => set(() => ({ model })),
  setProvider: provider => set(() => ({ provider })),
}));