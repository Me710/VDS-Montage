'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { renderCanvas, CANVAS_SIZE, exportCanvasAsPNG } from '@/lib/canvas-utils'
import { Download, Loader2, Share2 } from 'lucide-react'

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSending, setIsSending] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const {
    type,
    templateIndex,
    title,
    quote,
    author,
    backgroundImage,
    customLogo,
    frameColor,
    textColor,
    overlayColor,
    overlayOpacity,
    isGenerating,
    getCurrentTemplate,
  } = useEditorStore()

  const updateCanvas = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const template = getCurrentTemplate()
    
    await renderCanvas(ctx, template, {
      title,
      quote,
      author,
      backgroundImage,
      customLogo,
      frameColor,
      textColor,
      overlayColor,
      overlayOpacity,
    })
  }, [
    type,
    templateIndex,
    title,
    quote,
    author,
    backgroundImage,
    customLogo,
    frameColor,
    textColor,
    overlayColor,
    overlayOpacity,
    getCurrentTemplate,
  ])

  useEffect(() => {
    updateCanvas()
  }, [updateCanvas])

  // Send image to Telegram for backup
  const sendToTelegram = async (imageData: string) => {
    try {
      const caption = `📸 VDS Montage\n\n📝 ${title}\n\n"${quote.substring(0, 100)}${quote.length > 100 ? '...' : ''}"\n\n${author ? `— ${author}` : ''}`
      
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, caption }),
      })
    } catch (error) {
      console.error('Failed to send to Telegram:', error)
    }
  }

  // Convert canvas to blob
  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      }, 'image/png', 1.0)
    })
  }

  // Share to WhatsApp
  const handleShareWhatsApp = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsSharing(true)

    try {
      const blob = await canvasToBlob(canvas)
      const file = new File([blob], 'vds-montage.png', { type: 'image/png' })
      
      const shareText = `✨ ${title}\n\n"${quote}"\n\n${author ? `— ${author}` : ''}\n\n📸 Créé avec VDS Montage`

      // Check if Web Share API with files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'VDS Montage',
          text: shareText,
        })
      } else {
        // Fallback: Download image and open WhatsApp with text
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png', 1.0)
        link.download = `vds-${type}-${Date.now()}.png`
        link.click()

        // Open WhatsApp with pre-filled text
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n(Image téléchargée)')}`
        window.open(whatsappUrl, '_blank')
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleExport = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setIsSending(true)
    
    // Get image data for Telegram
    const imageData = canvas.toDataURL('image/png', 1.0)
    
    // Export locally
    exportCanvasAsPNG(canvas, type)
    
    // Send to Telegram (non-blocking)
    sendToTelegram(imageData)
    
    setIsSending(false)
  }

  return (
    <div className="flex flex-col items-center gap-3 h-full">
      <div className="relative canvas-container p-1.5 flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="max-w-full max-h-full rounded-lg object-contain"
          style={{ maxHeight: 'calc(100vh - 140px)' }}
        />
        
        {isGenerating && (
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-white text-sm font-medium">Génération...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleExport}
          disabled={isGenerating || isSending}
          className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Télécharger
        </button>
        
        <button
          onClick={handleShareWhatsApp}
          disabled={isGenerating || isSharing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSharing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <WhatsAppIcon className="w-4 h-4" />
          )}
          WhatsApp
        </button>
      </div>
    </div>
  )
}
