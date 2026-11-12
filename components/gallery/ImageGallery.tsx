'use client'

import { useRef } from 'react'
import { useEditorStore } from '@/lib/store'
import { galleryImages } from '@/lib/templates'
import { FileValidationError, readImageAsDataUrl } from '@/lib/files'
import { toast } from '@/lib/toast-store'
import { Upload, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_BACKGROUND_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ImageGallery() {
  const { type, backgroundImage, setBackgroundImage } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentImages = galleryImages[type] ?? []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset input so the same file can be selected again
    e.target.value = ''
    if (!file) return

    try {
      const dataUrl = await readImageAsDataUrl(file, {
        maxBytes: MAX_BACKGROUND_BYTES,
        acceptedTypes: ACCEPTED_TYPES,
      })
      setBackgroundImage(dataUrl)
    } catch (err) {
      toast.error(err instanceof FileValidationError ? err.message : "L'import de l'image a échoué.")
    }
  }

  return (
    <div className="section-card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold text-white">Image de Fond</h3>
        </div>
        {backgroundImage && (
          <button
            type="button"
            onClick={() => setBackgroundImage(null)}
            className="text-[11px] text-white/50 hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleImageUpload}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn-secondary w-full py-2 text-xs"
      >
        <Upload className="w-3.5 h-3.5" aria-hidden />
        Importer une image
      </button>

      {/* Gallery grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white/50">Galerie</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {currentImages.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => setBackgroundImage(image.url)}
              aria-label={`Utiliser l'image « ${image.name} »`}
              aria-pressed={backgroundImage === image.url}
              title={image.name}
              className={cn(
                'gallery-item aspect-square rounded',
                backgroundImage === image.url && 'active'
              )}
            >
              <img
                src={image.url}
                alt=""
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
