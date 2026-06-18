import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
}

interface ToastStore {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = String(++counter);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    // Auto-dismiss after 4 s.
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Shorthand for achievement unlock notifications. */
export function toastAchievement(name: string, emoji: string) {
  useToastStore.getState().push({
    message: `${emoji} Succès débloqué : ${name} !`,
    type: "success",
  });
}
