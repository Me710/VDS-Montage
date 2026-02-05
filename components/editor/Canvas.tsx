'use client'

import { useEffect, useCallback, forwardRef } from 'react'
import { useEditorStore } from '@/lib/store'
import { renderCanvas, CANVAS_SIZE } from '@/lib/canvas-utils'
import { Loader2 } from 'lucide-react'

export const Canvas = forwardRef<HTMLCanvasElement>(function Canvas(_, ref) {
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
    const canvas = ref && 'current' in ref ? ref.current : null
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
    ref,
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

  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative canvas-container p-1.5 flex items-center justify-center">
        <canvas
          ref={ref}
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
    </div>
  )
})
