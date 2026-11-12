import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastItem[]
  show: (message: string, type?: ToastType) => void
  dismiss: (id: number) => void
}

let nextId = 0
const MAX_TOASTS = 3

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: ++nextId, message, type }].slice(-MAX_TOASTS),
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

// Utilisable partout, y compris hors composant React.
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
}
