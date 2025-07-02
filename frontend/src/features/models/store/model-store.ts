import { create } from 'zustand';
import { StandardModel } from '../types/models';
import { persist } from 'zustand/middleware';

type ModelStore = {
  model: StandardModel | null;
  setModel: (model: StandardModel) => void;
};

export const useModelStore = create<ModelStore>()(
  persist(
    set => ({
      model: null,
      setModel: model => set(() => ({ model })),
    }),
    {
      name: 'model-storage', // name of the item in the storage (must be unique)
    },
  ),
);
