'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore, type ToastItem } from '@/lib/toast-store'

const DURATION_MS: Record<ToastItem['type'], number> = {
  success: 3500,
  info: 4500,
  error: 7000,
}

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" aria-hidden />,
  error: <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden />,
  info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" aria-hidden />,
}

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), DURATION_MS[item.type])
    return () => clearTimeout(timer)
  }, [item.id, item.type, dismiss])

  return (
    <div
      role={item.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'toast-card',
        item.type === 'success' && 'border-l-4 border-l-green-500',
        item.type === 'error' && 'border-l-4 border-l-red-500',
        item.type === 'info' && 'border-l-4 border-l-blue-500'
      )}
    >
      {ICONS[item.type]}
      <span className="flex-1 text-sm leading-snug">{item.message}</span>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Fermer la notification"
        className="text-white/50 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" aria-hidden />
      </button>
    </div>
  )
}

// Monté une seule fois dans le layout : affiche les notifications de toute l'app.
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div
      aria-live="polite"
      className="fixed z-[60] inset-x-3 top-3 sm:inset-x-auto sm:top-auto sm:bottom-6 sm:right-6 sm:w-96 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  )
}
