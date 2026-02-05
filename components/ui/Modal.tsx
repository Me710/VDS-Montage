'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ModalType = 'success' | 'error' | 'info'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: ModalType
  confirmText?: string
  onConfirm?: () => void
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colorMap = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    button: 'bg-green-500 hover:bg-green-600',
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    button: 'bg-red-500 hover:bg-red-600',
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
}: ModalProps) {
  const Icon = iconMap[type]
  const colors = colorMap[type]

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-2xl ${colors.bg} border ${colors.border} p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-white/70 text-sm mb-6">{message}</p>
          
          {/* Button */}
          <button
            onClick={handleConfirm}
            className={`w-full py-3 px-6 rounded-xl ${colors.button} text-white font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
