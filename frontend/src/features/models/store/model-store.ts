import { create } from 'zustand';
import { StandardModel } from '../types/models';

type ModelStore = {
  model: StandardModel | null;
  setModel: (model: StandardModel) => void;
};

export const useModelStore = create<ModelStore>(set => ({
  model: null,
  setModel: model => set(() => ({ model })),
}));
