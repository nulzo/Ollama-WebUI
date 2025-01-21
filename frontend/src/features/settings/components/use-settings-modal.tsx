import { create } from 'zustand';

interface SettingsModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSettingsModal = create<SettingsModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));