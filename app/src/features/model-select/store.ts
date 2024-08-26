import {createStore} from "zustand";

const useDropdownStore = createStore((set) => ({
    dropdownValue: null,

    setDropdownValue: (value) => set({ dropdownValue: value }),
}));

export { useDropdownStore };
