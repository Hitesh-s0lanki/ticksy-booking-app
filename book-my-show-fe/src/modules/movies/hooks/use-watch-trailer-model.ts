import { create } from "zustand";

interface ModalStore {
  isOpen: boolean;
  movieId?: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useWatchTrailerModel = create<ModalStore>((set) => ({
  isOpen: false,
  movieId: undefined,
  onOpen: (id) => set({ isOpen: true, movieId: id }),
  onClose: () => set({ isOpen: false }),
}));
