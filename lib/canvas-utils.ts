import { Template, FrameStyle } from './templates'
import { loadImage, wrapText, hexToRgb } from './utils'

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
}

export const CANVAS_SIZE = 1024

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

  try {
    // Load and draw background image
    const bgImage = await loadImage(bgUrl)
    
    // Draw background (cover fit)
    const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height)
    const x = (canvas.width - bgImage.width * scale) / 2
    const y = (canvas.height - bgImage.height * scale) / 2
    ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale)

    // Draw overlay
    drawOverlay(ctx, state)

    // Draw frame
    drawFrame(ctx, template, state)

    // Draw text content
    drawTextContent(ctx, template, state)

    // Draw logo
    await drawLogo(ctx, state)

  } catch (error) {
    console.error('Error rendering canvas:', error)
    // Draw fallback gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#2c3e50')
    gradient.addColorStop(1, '#3498db')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: CanvasState): void {
  const canvas = ctx.canvas
  const opacity = state.overlayOpacity / 100
  const { r, g, b } = hexToRgb(state.overlayColor)
  
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawFrame(ctx: CanvasRenderingContext2D, template: Template, state: CanvasState): void {
  const canvas = ctx.canvas
  ctx.strokeStyle = state.frameColor
  ctx.lineWidth = 8

  switch (template.frameStyle) {
    case 'circular':
      drawCircularFrame(ctx, canvas)
      break
    case 'geometric':
      drawGeometricFrame(ctx, canvas, state)
      break
    case 'ornate':
      drawOrnateFrame(ctx, canvas, state)
      break
    case 'geometric-sacred':
      drawSacredGeometryFrame(ctx, canvas)
      break
    default:
      drawElegantFrame(ctx, canvas)
  }
}

function drawCircularFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, 400, 0, Math.PI * 2)
  ctx.stroke()
  
  // Additional decorative circle
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, 420, 0, Math.PI * 2)
  ctx.stroke()
}

function drawGeometricFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: CanvasState): void {
  const margin = 60
  const logo = getLogoPosition(canvas)
  
  // Draw frame with cutout for logo
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, state.frameColor)
  
  // Corner decorations (skip bottom-right which is near logo)
  const cornerSize = 40
  ctx.lineWidth = 6
  drawCornerDecoration(ctx, margin, margin, cornerSize)
  drawCornerDecoration(ctx, canvas.width - margin, margin, cornerSize, true)
  drawCornerDecoration(ctx, margin, canvas.height - margin, cornerSize, false, true)
  // Bottom-right corner omitted to avoid logo overlap
}

function drawCornerDecoration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flipH = false,
  flipV = false
): void {
  ctx.save()
  ctx.translate(x, y)
  if (flipH) ctx.scale(-1, 1)
  if (flipV) ctx.scale(1, -1)
  
  ctx.beginPath()
  ctx.moveTo(0, size)
  ctx.lineTo(0, 0)
  ctx.lineTo(size, 0)
  ctx.stroke()
  
  ctx.restore()
}

// Draw a rectangular frame with a smooth cutout for the logo in bottom-right corner
function drawFrameWithLogoCutout(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  margin: number,
  logo: { x: number; y: number; radius: number },
  frameColor: string
): void {
  const left = margin
  const top = margin
  const right = canvas.width - margin
  const bottom = canvas.height - margin
  
  // Calculate cutout dimensions
  const cutoutSize = logo.radius + 10  // Extra padding
  const cutoutStartX = logo.x - cutoutSize
  const cutoutStartY = logo.y - cutoutSize
  const curveRadius = 20  // Radius for smooth corners
  
  ctx.strokeStyle = frameColor
  
  ctx.beginPath()
  
  // Start from top-left corner
  ctx.moveTo(left, top)
  
  // Top edge
  ctx.lineTo(right, top)
  
  // Right edge - go down to cutout
  ctx.lineTo(right, cutoutStartY - curveRadius)
  
  // Smooth curve into horizontal cutout
  ctx.quadraticCurveTo(right, cutoutStartY, right - curveRadius, cutoutStartY)
  
  // Horizontal line toward logo
  ctx.lineTo(cutoutStartX + curveRadius, cutoutStartY)
  
  // Smooth curve down
  ctx.quadraticCurveTo(cutoutStartX, cutoutStartY, cutoutStartX, cutoutStartY + curveRadius)
  
  // Vertical line down to bottom edge level
  ctx.lineTo(cutoutStartX, bottom - curveRadius)
  
  // Smooth curve to bottom edge
  ctx.quadraticCurveTo(cutoutStartX, bottom, cutoutStartX - curveRadius, bottom)
  
  // Bottom edge to left
  ctx.lineTo(left, bottom)
  
  // Left edge back to start
  ctx.lineTo(left, top)
  
  ctx.stroke()
}

function drawOrnateFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: CanvasState): void {
  const margin = 50
  const logo = getLogoPosition(canvas)
  
  // Outer frame with cutout
  ctx.lineWidth = 10
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, state.frameColor)
  
  // Inner frame with cutout
  ctx.lineWidth = 4
  drawFrameWithLogoCutout(ctx, canvas, margin + 20, logo, state.frameColor)
  
  // Draw decorative corners (skip bottom-right near logo)
  const cornerPositions = [
    { x: margin, y: margin },
    { x: canvas.width - margin, y: margin },
    { x: margin, y: canvas.height - margin },
    // Bottom-right omitted
  ]

  cornerPositions.forEach(pos => {
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.fillStyle = state.frameColor
    ctx.beginPath()
    ctx.arc(0, 0, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function drawSacredGeometryFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  
  ctx.lineWidth = 6
  
  // Draw diamond shape
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - 380)
  ctx.lineTo(centerX + 380, centerY)
  ctx.lineTo(centerX, centerY + 380)
  ctx.lineTo(centerX - 380, centerY)
  ctx.closePath()
  ctx.stroke()
}

function drawElegantFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const margin = 70
  const logo = getLogoPosition(canvas)
  const frameColor = ctx.strokeStyle as string
  
  // Main frame with cutout
  ctx.lineWidth = 6
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, frameColor)
  
  // Inner accent line with cutout
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6
  drawFrameWithLogoCutout(ctx, canvas, margin + 15, logo, frameColor)
  ctx.globalAlpha = 1.0
}

function drawTextContent(ctx: CanvasRenderingContext2D, template: Template, state: CanvasState): void {
  const canvas = ctx.canvas
  ctx.fillStyle = state.textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // Draw title
  ctx.font = `${template.titleSize}px '${template.titleFont}', serif`
  ctx.fillText(state.title, centerX, 200)

  // Draw decorative line under title
  ctx.fillStyle = state.frameColor
  ctx.fillRect(centerX - 100, 240, 200, 3)

  // Draw quote (with text wrapping)
  ctx.fillStyle = state.textColor
  ctx.font = `${template.quoteSize}px '${template.quoteFont}', sans-serif`
  wrapText(ctx, state.quote, centerX, centerY, 700, template.quoteSize * 1.4)

  // Draw author
  if (state.author) {
    ctx.font = `italic ${template.authorSize}px '${template.authorFont}', serif`
    ctx.fillText(`— ${state.author}`, centerX, canvas.height - 200)
  }
}

// Default VDS logo path
const DEFAULT_LOGO_PATH = '/images/logo-vds.png'

// Logo configuration - shared between logo and frame functions
const LOGO_CONFIG = {
  size: 80,           // Logo size in pixels (circular shape)
  marginRight: 90,    // Distance from right edge
  marginBottom: 70,   // Distance from bottom edge
  shadowBlur: 15,     // White glow for visibility
  shadowColor: 'rgba(255, 255, 255, 0.8)',
  cutoutPadding: 15,  // Extra space around logo for frame cutout
}

// Get logo position (used by both logo and frame functions)
function getLogoPosition(canvas: HTMLCanvasElement) {
  return {
    x: canvas.width - LOGO_CONFIG.marginRight,
    y: canvas.height - LOGO_CONFIG.marginBottom,
    size: LOGO_CONFIG.size,
    radius: LOGO_CONFIG.size / 2 + LOGO_CONFIG.cutoutPadding,
  }
}

async function drawLogo(ctx: CanvasRenderingContext2D, state: CanvasState): Promise<void> {
  const canvas = ctx.canvas
  const logoX = canvas.width - LOGO_CONFIG.marginRight
  const logoY = canvas.height - LOGO_CONFIG.marginBottom
  const logoSize = LOGO_CONFIG.size

  ctx.save()

  // Determine which logo to use
  const logoUrl = state.customLogo || DEFAULT_LOGO_PATH

  try {
    const logoImg = await loadImage(logoUrl)
    
    // Add white glow/shadow for visibility on dark backgrounds
    ctx.shadowColor = LOGO_CONFIG.shadowColor
    ctx.shadowBlur = LOGO_CONFIG.shadowBlur
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

function drawFallbackLogo(
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

export function exportCanvasAsPNG(canvas: HTMLCanvasElement, type: string): void {
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().slice(0, 10)
  link.download = `${type}-${timestamp}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
}
