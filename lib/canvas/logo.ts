// Logo VDS (ou logo personnalisé) : position et dessin.

import { loadImage } from '../utils'
import type { CanvasState } from './types'
import { scaleMin } from './helpers'

// Default VDS logo path
export const DEFAULT_LOGO_PATH = '/images/logo-vds.png'

// Logo configuration — scales with canvas min-dimension
export function getLogoConfig(canvas: HTMLCanvasElement) {
  const s = Math.min(canvas.width, canvas.height) / 1024
  return {
    size: Math.round(80 * s),
    marginRight: Math.round(90 * s),
    marginBottom: Math.round(70 * s),
    shadowBlur: 15,
    shadowColor: 'rgba(255, 255, 255, 0.8)' as const,
    cutoutPadding: Math.round(15 * s),
  }
}

// Get logo position (used by both logo and frame functions)
export function getLogoPosition(canvas: HTMLCanvasElement) {
  const cfg = getLogoConfig(canvas)
  return {
    x: canvas.width - cfg.marginRight,
    y: canvas.height - cfg.marginBottom,
    size: cfg.size,
    radius: cfg.size / 2 + cfg.cutoutPadding,
  }
}

export async function drawLogo(ctx: CanvasRenderingContext2D, state: CanvasState): Promise<void> {
  const canvas = ctx.canvas
  const cfg = getLogoConfig(canvas)
  const logoX = canvas.width - cfg.marginRight
  const logoY = canvas.height - cfg.marginBottom
  const logoSize = cfg.size

  ctx.save()

  const logoUrl = state.customLogo || DEFAULT_LOGO_PATH

  try {
    const logoImg = await loadImage(logoUrl)
    
    ctx.shadowColor = cfg.shadowColor
    ctx.shadowBlur = cfg.shadowBlur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Draw logo image (circular shape, no background needed)
    ctx.drawImage(
      logoImg,
      logoX - logoSize / 2,
      logoY - logoSize / 2,
      logoSize,
      logoSize
    )
    
    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  } catch (error) {
    console.error('Failed to load logo:', error)
    // Fallback to text logo only if image fails
    drawFallbackLogo(ctx, logoX, logoY, state.frameColor)
  }

  ctx.restore()
}

export function drawFallbackLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frameColor: string
): void {
  // White glow for text
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
  ctx.shadowBlur = 10
  
  // Text with frame color
  ctx.fillStyle = frameColor
  ctx.font = 'bold 28px Inter'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VDS', x, y)
}

// Draw logo for "Un Regard au Ciel" style - top right
export async function drawRegardCielLogo(ctx: CanvasRenderingContext2D, state: CanvasState): Promise<void> {
  const canvas = ctx.canvas
  const logoSize = scaleMin(70, canvas)
  const margin = scaleMin(30, canvas)
  const logoX = canvas.width - margin - logoSize / 2
  const logoY = margin + logoSize / 2
  
  ctx.save()
  
  // Draw white background circle for logo
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(logoX, logoY, logoSize / 2 + 5, 0, Math.PI * 2)
  ctx.fill()
  
  // Load and draw logo
  const logoUrl = state.customLogo || DEFAULT_LOGO_PATH
  
  try {
    const logoImg = await loadImage(logoUrl)
    ctx.drawImage(
      logoImg,
      logoX - logoSize / 2,
      logoY - logoSize / 2,
      logoSize,
      logoSize
    )
  } catch (error) {
    console.error('Failed to load logo:', error)
  }
  
  ctx.restore()
}
