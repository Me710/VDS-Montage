'use client'

import { useRef } from 'react'
import { useEditorStore } from '@/lib/store'
import { galleryImages } from '@/lib/templates'
import { Upload, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ImageGallery() {
  const { type, backgroundImage, setBackgroundImage } = useEditorStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentImages = galleryImages[type]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="section-card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Image de Fond</h3>
        </div>
        {backgroundImage && (
          <button
            onClick={() => setBackgroundImage(null)}
            className="text-[10px] text-white/40 hover:text-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-secondary w-full py-2 text-xs"
      >
        <Upload className="w-3.5 h-3.5" />
        Importer
      </button>

      {/* Gallery grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white/50">Galerie</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {currentImages.map((image, index) => (
            <div
              key={index}
              onClick={() => setBackgroundImage(image.url)}
              className={cn(
                'gallery-item aspect-square rounded',
                backgroundImage === image.url && 'active'
              )}
            >
              <img
                src={image.url}
                alt={image.name}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
