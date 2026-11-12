'use client'

import { useRef, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { FileValidationError, readImageAsDataUrl } from '@/lib/files'
import { toast } from '@/lib/toast-store'
import { Upload, Trash2, Image, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOGO_STORAGE_KEY = 'vds-custom-logo'
const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

// Le logo personnalisé est conservé dans le navigateur (localStorage) : il est
// restauré au chargement par lib/store.ts.
export function LogoUploader() {
  const { customLogo, setCustomLogo } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset input so the same file can be selected again
    e.target.value = ''
    if (!file) return

    setIsUploading(true)
    try {
      const dataUrl = await readImageAsDataUrl(file, {
        maxBytes: MAX_LOGO_BYTES,
        acceptedTypes: ACCEPTED_TYPES,
      })
      setCustomLogo(dataUrl)

      try {
        localStorage.setItem(LOGO_STORAGE_KEY, dataUrl)
        toast.success('Logo enregistré.')
      } catch {
        // Quota dépassé ou stockage indisponible (navigation privée)
        toast.info('Logo appliqué, mais il ne sera pas conservé après fermeture de la page.')
      }
    } catch (err) {
      toast.error(err instanceof FileValidationError ? err.message : "L'import du logo a échoué.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setCustomLogo(null)
    try { localStorage.removeItem(LOGO_STORAGE_KEY) } catch { /* storage unavailable */ }
    toast.info('Logo par défaut rétabli.')
  }

  return (
    <div className="section-card space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Logo</h3>
      </div>

      {/* Current logo preview */}
      {customLogo && (
        <div className="flex items-center gap-3 p-2 bg-dark-light/50 rounded-lg">
          <div className="w-10 h-10 rounded overflow-hidden bg-dark-lighter flex items-center justify-center">
            <img
              src={customLogo}
              alt="Logo personnalisé"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs text-white/60 flex-1">Logo personnalisé</span>
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
            aria-label="Supprimer le logo personnalisé"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'btn-secondary w-full py-2 text-xs',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
            Import...
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" aria-hidden />
            {customLogo ? 'Changer le logo' : 'Importer un logo'}
          </>
        )}
      </button>
      <p className="text-[10px] text-white/40">PNG, JPEG, WebP ou GIF, 2 Mo maximum.</p>
    </div>
  )
}
