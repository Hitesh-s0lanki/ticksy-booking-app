// stores/usePreviewDialog.ts
import { create } from "zustand";

export type PreviewType = "image" | "pdf" | "auto";

interface PreviewDialogStore {
  isOpen: boolean;
  url?: string;
  title?: string;
  type: PreviewType;
  onOpen: (
    url: string,
    options?: { type?: PreviewType; title?: string }
  ) => void;
  onClose: () => void;
}

export const usePreviewDialog = create<PreviewDialogStore>((set) => ({
  isOpen: false,
  url: undefined,
  title: undefined,
  type: "auto",
  onOpen: (url, options) =>
    set({
      isOpen: true,
      url,
      type: options?.type ?? "auto",
      title: options?.title,
    }),
  onClose: () =>
    set({ isOpen: false, url: undefined, title: undefined, type: "auto" }),
}));
