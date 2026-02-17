'use client'

import { useRef, useState, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { Upload, Trash2, Image, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoUploader() {
  const { customLogo, setCustomLogo } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved logo from localStorage on mount
  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('vds-custom-logo')
      if (savedLogo && !customLogo) {
        setCustomLogo(savedLogo)
      }
    } catch {
      // localStorage may be unavailable in private browsing
    }
  }, [customLogo, setCustomLogo])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsUploading(true)

    try {
      // For now, use local data URL (localStorage-based)
      // In production with Vercel Blob configured, this would upload to blob storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setCustomLogo(dataUrl)
        try { localStorage.setItem('vds-custom-logo', dataUrl) } catch { /* storage unavailable */ }
        setIsUploading(false)
      }
      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)

      // Optional: Upload to Vercel Blob if configured
      // const formData = new FormData()
      // formData.append('logo', file)
      // const response = await fetch('/api/logo', {
      //   method: 'POST',
      //   body: formData,
      // })
      // if (response.ok) {
      //   const data = await response.json()
      //   setCustomLogo(data.url)
      //   localStorage.setItem('vds-custom-logo', data.url)
      // }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
      setIsUploading(false)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = () => {
    setCustomLogo(null)
    try { localStorage.removeItem('vds-custom-logo') } catch { /* storage unavailable */ }
  }

  return (
    <div className="section-card space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-white">Logo</h3>
      </div>

      {/* Current logo preview */}
      {customLogo && (
        <div className="flex items-center gap-3 p-2 bg-dark-light/50 rounded-lg">
          <div className="w-10 h-10 rounded overflow-hidden bg-dark-lighter flex items-center justify-center">
            <img
              src={customLogo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs text-white/60 flex-1">Logo personnalisé</span>
          <button
            onClick={handleRemoveLogo}
            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'btn-secondary w-full py-2 text-xs',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Upload...
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            {customLogo ? 'Changer' : 'Uploader logo'}
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
