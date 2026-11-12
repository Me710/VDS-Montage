// Types et dimensions du canvas.

// ─── Format support ─────────────────────────────────────────────────────────
export type CanvasFormat = '1:1' | '16:9' | '9:16'

export const CANVAS_DIMENSIONS: Record<CanvasFormat, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1024, height: 576 },
  '9:16': { width: 576, height: 1024 },
}

export interface CanvasState {
  title: string
  quote: string
  author: string
  backgroundImage: string | null
  customLogo: string | null
  frameColor: string
  textColor: string
  overlayColor: string
  overlayOpacity: number
  customFontFamily: string
  fontSizeOffset: number
}

export const CANVAS_SIZE = 1024
