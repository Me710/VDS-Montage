'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { renderCanvas, CANVAS_SIZE, exportCanvasAsPNG } from '@/lib/canvas-utils'
import { Download, Loader2, Send } from 'lucide-react'

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isSending, setIsSending] = useState(false)
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

      <button
        onClick={handleExport}
        disabled={isGenerating}
        className="btn-primary px-8 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Download className="w-4 h-4" />
        Télécharger PNG
      </button>
    </div>
  )
}
