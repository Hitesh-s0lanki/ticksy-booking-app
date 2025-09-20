import { create } from "zustand";

type Phase = "loading" | "success" | "error";

interface SuccessModelStore {
  isOpen: boolean;
  phase: Phase;
  onOpen: (phase?: Phase) => void;
  onClose: () => void;
  setPhase: (phase: Phase) => void;
}

export const useSuccessModel = create<SuccessModelStore>((set) => ({
  isOpen: false,
  phase: "loading",
  onOpen: (phase = "loading") => set({ isOpen: true, phase }),
  onClose: () => set({ isOpen: false, phase: "loading" }),
  setPhase: (phase) => set({ phase }),
}));
