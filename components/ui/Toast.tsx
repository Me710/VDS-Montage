'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    
    // Auto close
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  return (
    <div
      className={cn(
        'toast',
        isVisible && 'show',
        type === 'success' && 'toast-success',
        type === 'error' && 'toast-error'
      )}
    >
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast hook for managing multiple toasts
interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}
