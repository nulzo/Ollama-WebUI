import { create } from 'zustand';

interface ErrorState {
  isOpen: boolean;
  error: {
    status?: number;
    message?: string;
  } | null;
  showError: (error: { status?: number; message?: string }) => void;
  hideError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  isOpen: false,
  error: null,
  showError: (error) => set({ isOpen: true, error }),
  hideError: () => set({ isOpen: false, error: null }),
}));