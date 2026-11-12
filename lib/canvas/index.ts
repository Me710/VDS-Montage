// Point d'entrée du rendu : fond, overlay, cadre, texte, logo.

import type { Template } from '../templates'
import { loadImage } from '../utils'
import type { CanvasState } from './types'
import { drawLogo, drawRegardCielLogo } from './logo'
import { drawOverlay, drawFrame } from './frames'
import { drawTextContent } from './text'

export { CANVAS_DIMENSIONS, CANVAS_SIZE } from './types'
export type { CanvasFormat, CanvasState } from './types'

export async function renderCanvas(
  ctx: CanvasRenderingContext2D,
  template: Template,
  state: CanvasState
): Promise<void> {
  const canvas = ctx.canvas
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Get background image URL
  const bgUrl = state.backgroundImage || template.defaultBg

  // Try to load background image, use fallback gradient if it fails
  let bgLoaded = false
  try {
    const bgImage = await loadImage(bgUrl)
    
    // Draw background (cover fit)
    const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height)
    const x = (canvas.width - bgImage.width * scale) / 2
    const y = (canvas.height - bgImage.height * scale) / 2
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale)
    bgLoaded = true
  } catch (error) {
    console.error('Error loading background image:', error)
    // Draw fallback gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#2c3e50')
    gradient.addColorStop(1, '#3498db')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // Always draw overlay, frame, text and logo (even if bg failed)
  try {
    // Draw overlay
    drawOverlay(ctx, state)

    // Draw frame
    drawFrame(ctx, template, state)

    // Draw text content
    drawTextContent(ctx, template, state)

    // Draw logo (different position for regard-ciel)
    if (template.frameStyle.startsWith('regard-ciel')) {
      await drawRegardCielLogo(ctx, state)
    } else {
      await drawLogo(ctx, state)
    }
  } catch (error) {
    console.error('Error rendering canvas elements:', error)
  }
}
