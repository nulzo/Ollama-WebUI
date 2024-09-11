import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

import { ThemeColor } from '@/config/themes';

type Config = {
  theme: ThemeColor['name'];
};

type ConfigStore = Config & {
  updateConfig: (newConfig: Partial<Config>) => void;
};

const createConfigStore: StateCreator<ConfigStore> = set => ({
  theme: 'zinc',
  updateConfig: newConfig => set(state => ({ ...state, ...newConfig })),
});

const useConfigStore = create(
  persist(createConfigStore, {
    name: 'config',
    getStorage: () => localStorage,
    partialize: state => ({ theme: state.theme }),
  })
);

export function useConfig() {
  return useConfigStore();
}
