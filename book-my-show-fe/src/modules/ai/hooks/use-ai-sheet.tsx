import { create } from "zustand";

interface AiSheetStore {
  isOpen: boolean;
  firstChat: string | "";
  onOpen: (chat: string) => void;
  onClose: () => void;
  clearFirstChat: () => void;
}

export const useAiSheet = create<AiSheetStore>((set) => ({
  isOpen: false,
  firstChat: "",
  onOpen: (chat) => set({ isOpen: true, firstChat: chat }),
  onClose: () => set({ isOpen: false, firstChat: "" }),
  clearFirstChat: () => set({ firstChat: "" }),
}));
