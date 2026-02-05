'use client'

import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Chargement...' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="flex flex-col items-center gap-4">
        <div className="loading-spinner" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  )
}
