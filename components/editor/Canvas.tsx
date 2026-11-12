'use client'

import { useEffect, useCallback, forwardRef, useRef } from 'react'
import { useEditorStore } from '@/lib/store'
import { renderCanvas, CANVAS_DIMENSIONS, type CanvasState } from '@/lib/canvas'
import type { Template } from '@/lib/templates'
import { Loader2 } from 'lucide-react'

interface RenderJob {
  template: Template
  state: CanvasState
}

export const Canvas = forwardRef<HTMLCanvasElement>(function Canvas(_, externalRef) {
  const internalRef = useRef<HTMLCanvasElement | null>(null)

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
    generatingText,
    generatingImage,
    getCurrentTemplate,
  } = useEditorStore()

  const dims = CANVAS_DIMENSIONS[canvasFormat]

  // File de rendu « le dernier gagne » : renderCanvas est asynchrone (chargement
  // d'images). Sans cette file, un rendu ancien qui se termine tard pouvait
  // écraser un rendu plus récent.
  const latestJob = useRef<RenderJob | null>(null)
  const renderLoop = useRef({ running: false, pending: false })

  const scheduleRender = useCallback(async () => {
    const loop = renderLoop.current
    if (loop.running) {
      loop.pending = true
      return
    }

    loop.running = true
    try {
      do {
        loop.pending = false
        const job = latestJob.current
        const ctx = internalRef.current?.getContext('2d')
        if (!job || !ctx) break
        try {
          await renderCanvas(ctx, job.template, job.state)
        } catch (error) {
          console.error('Error in renderCanvas:', error)
        }
      } while (loop.pending)
    } finally {
      loop.running = false
    }
  }, [])

  // Re-render whenever something visible changes
  useEffect(() => {
    const template = getCurrentTemplate()
    if (!template) return

    latestJob.current = {
      template,
      state: {
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
      },
    }
    scheduleRender()
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
    customFontFamily,
    fontSizeOffset,
    canvasFormat,
    getCurrentTemplate,
    scheduleRender,
  ])

  // Les polices web arrivent après le premier rendu : on redessine une fois
  // qu'elles sont prêtes, sinon le texte reste dans la police de secours.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready
      .then(() => {
        if (!cancelled) scheduleRender()
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [scheduleRender, customFontFamily])

  // Callback ref to handle both internal and external refs
  const setRefs = useCallback((node: HTMLCanvasElement | null) => {
    internalRef.current = node

    if (externalRef) {
      if (typeof externalRef === 'function') {
        externalRef(node)
      } else {
        (externalRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node
      }
    }
    if (node) scheduleRender()
  }, [externalRef, scheduleRender])

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative canvas-container p-1 md:p-1.5 flex items-center justify-center">
        <canvas
          ref={setRefs}
          width={dims.width}
          height={dims.height}
          role="img"
          aria-label={`Aperçu du visuel${title ? ` : ${title}` : ''}`}
          className="max-w-full max-h-full rounded-lg object-contain"
          style={{
            maxHeight: 'calc(100dvh - 140px)',
            maxWidth: 'calc(100vw - 16px)'
          }}
        />

        {/* Image en cours : on masque l'aperçu, il va changer entièrement */}
        {generatingImage && (
          <div
            role="status"
            className="absolute inset-0 bg-dark/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-2 md:gap-3 px-4 text-center"
          >
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary animate-spin" aria-hidden />
            <p className="text-white text-xs md:text-sm font-medium">
              {generatingText ? 'Génération du texte et de l\'image...' : 'Génération de l\'image...'}
            </p>
            <p className="text-white/50 text-[11px] md:text-xs">Cela peut prendre jusqu&apos;à une minute.</p>
          </div>
        )}

        {/* Texte seul : indicateur discret, l'aperçu reste visible */}
        {generatingText && !generatingImage && (
          <div
            role="status"
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark/85 border border-white/10 text-white text-xs"
          >
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" aria-hidden />
            Génération du texte...
          </div>
        )}
      </div>
    </div>
  )
})
