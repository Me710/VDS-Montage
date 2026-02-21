'use client'

import { useEffect, useCallback, forwardRef, useRef, useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { renderCanvas, CANVAS_DIMENSIONS } from '@/lib/canvas-utils'
import { Loader2 } from 'lucide-react'

export const Canvas = forwardRef<HTMLCanvasElement>(function Canvas(_, externalRef) {
  const internalRef = useRef<HTMLCanvasElement>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  
  // Always use internal ref for canvas operations
  const canvasRef = internalRef
  
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
    customFontFamily,
    fontSizeOffset,
    canvasFormat,
    isGenerating,
    getCurrentTemplate,
  } = useEditorStore()

  const dims = CANVAS_DIMENSIONS[canvasFormat]

  // Mark canvas as ready after mount
  useEffect(() => {
    setCanvasReady(true)
  }, [])

  const updateCanvas = useCallback(async () => {
    const canvas = canvasRef?.current
    if (!canvas) {
      console.log('Canvas not available')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Context not available')
      return
    }

    const template = getCurrentTemplate()
    if (!template) {
      console.log('Template not available')
      return
    }
    
    try {
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
        customFontFamily,
        fontSizeOffset,
      })
    } catch (error) {
      console.error('Error in renderCanvas:', error)
    }
  }, [
    canvasRef,
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
    customFontFamily,
    fontSizeOffset,
    canvasFormat,
    getCurrentTemplate,
  ])

  // Update canvas when dependencies change
  useEffect(() => {
    if (canvasReady) {
      updateCanvas()
    }
  }, [updateCanvas, canvasReady])
  
  // Also update on initial mount with a small delay to ensure DOM is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCanvas()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Callback ref to handle both internal and external refs
  const setRefs = useCallback((node: HTMLCanvasElement | null) => {
    // Set internal ref
    (internalRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node
    
    // Forward to external ref if provided
    if (externalRef) {
      if (typeof externalRef === 'function') {
        externalRef(node)
      } else {
        (externalRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node
      }
    }
  }, [externalRef])

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative canvas-container p-1 md:p-1.5 flex items-center justify-center">
        <canvas
          ref={setRefs}
          width={dims.width}
          height={dims.height}
          className="max-w-full max-h-full rounded-lg object-contain"
          style={{ 
            maxHeight: 'calc(100dvh - 140px)',
            maxWidth: 'calc(100vw - 16px)'
          }}
        />
        
        {isGenerating && (
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-2 md:gap-3">
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary animate-spin" />
            <p className="text-white text-xs md:text-sm font-medium">Génération...</p>
          </div>
        )}
      </div>
    </div>
  )
})
