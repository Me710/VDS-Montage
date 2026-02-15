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
  customFontFamily: string
  fontSizeOffset: number
}

export const CANVAS_SIZE = 1024

// Helper: resolve font family (custom override or template default)
function resolveFont(templateFont: string, customFont: string): string {
  return customFont || templateFont
}

// Helper: resolve font size with offset (clamped to min 8px)
function resolveSize(templateSize: number, offset: number): number {
  return Math.max(8, templateSize + offset)
}

// Helper: get font fallback string based on font family
function fontFallback(font: string): string {
  const serifFonts = ['Playfair Display', 'Lora', 'Merriweather', 'Cinzel', 'Cormorant Garamond', 'Libre Baskerville']
  const scriptFonts = ['Dancing Script']
  if (scriptFonts.includes(font)) return `'${font}', cursive`
  if (serifFonts.includes(font)) return `'${font}', serif`
  return `'${font}', sans-serif`
}

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
    case 'regard-ciel':
    case 'regard-ciel-nom':
    case 'regard-ciel-citation':
      drawRegardCielFrame(ctx, canvas, template.frameStyle)
      break
    case 'evangile-simple':
    case 'evangile-verset':
    case 'evangile-narratif':
      drawEvangileFrame(ctx, canvas, template.frameStyle)
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

// "Un Regard au Ciel" frame style - green banner at bottom with yellow hashtag
function drawRegardCielFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string): void {
  const bannerHeight = 100
  const bannerY = canvas.height - bannerHeight
  
  // Draw green banner at bottom
  ctx.fillStyle = '#2d6a4f'
  ctx.fillRect(0, bannerY, canvas.width, bannerHeight)
  
  // Draw hashtag in yellow italic
  ctx.fillStyle = '#ffd60a'
  ctx.font = 'italic bold 52px Playfair Display, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('#UnRegardAuCiel', canvas.width / 2, bannerY + bannerHeight / 2)
}

function drawEvangileFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string): void {
  // Draw a warm brown/sepia banner at bottom with gradient
  // Height varies based on style
  let gradientStart: number
  
  if (style === 'evangile-narratif') {
    // For narrative, gradient covers more of the image (up to 50%)
    gradientStart = canvas.height * 0.45
  } else if (style === 'evangile-verset') {
    gradientStart = canvas.height * 0.65
  } else {
    gradientStart = canvas.height * 0.75
  }
  
  // Create gradient for cinematic effect
  const gradient = ctx.createLinearGradient(0, gradientStart, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(0.2, 'rgba(10, 8, 5, 0.5)')
  gradient.addColorStop(0.5, 'rgba(15, 12, 8, 0.8)')
  gradient.addColorStop(1, 'rgba(10, 8, 5, 0.95)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, gradientStart, canvas.width, canvas.height - gradientStart)
}

function drawTextContent(ctx: CanvasRenderingContext2D, template: Template, state: CanvasState): void {
  const canvas = ctx.canvas
  
  // Handle "Un Regard au Ciel" styles differently
  if (template.frameStyle.startsWith('regard-ciel')) {
    drawRegardCielText(ctx, canvas, template, state)
    return
  }
  
  // Handle "L'Évangile Illustré" styles differently
  if (template.frameStyle.startsWith('evangile')) {
    drawEvangileText(ctx, canvas, template, state)
    return
  }
  
  ctx.fillStyle = state.textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // Resolve custom fonts and sizes
  const titleFont = resolveFont(template.titleFont, state.customFontFamily)
  const quoteFont = resolveFont(template.quoteFont, state.customFontFamily)
  const authorFont = resolveFont(template.authorFont, state.customFontFamily)
  const titleSize = resolveSize(template.titleSize, state.fontSizeOffset)
  const quoteSize = resolveSize(template.quoteSize, state.fontSizeOffset)
  const authorSize = resolveSize(template.authorSize, state.fontSizeOffset)

  // Draw title
  ctx.font = `${titleSize}px ${fontFallback(titleFont)}`
  ctx.fillText(state.title, centerX, 200)

  // Draw decorative line under title
  ctx.fillStyle = state.frameColor
  ctx.fillRect(centerX - 100, 240, 200, 3)

  // Draw quote (with text wrapping)
  ctx.fillStyle = state.textColor
  ctx.font = `${quoteSize}px ${fontFallback(quoteFont)}`
  wrapText(ctx, state.quote, centerX, centerY, 700, quoteSize * 1.4)

  // Draw author
  if (state.author) {
    ctx.font = `italic ${authorSize}px ${fontFallback(authorFont)}`
    ctx.fillText(`— ${state.author}`, centerX, canvas.height - 200)
  }
}

function drawRegardCielText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, template: Template, state: CanvasState): void {
  const centerX = canvas.width / 2
  const bannerHeight = 100
  
  // Resolve custom fonts and sizes
  const titleFont = resolveFont(template.titleFont, state.customFontFamily)
  const quoteFont = resolveFont(template.quoteFont, state.customFontFamily)
  const authorFont = resolveFont(template.authorFont, state.customFontFamily)
  const titleSize = resolveSize(template.titleSize, state.fontSizeOffset)
  const quoteSize = resolveSize(template.quoteSize, state.fontSizeOffset)
  const authorSize = resolveSize(template.authorSize, state.fontSizeOffset)
  
  switch (template.frameStyle) {
    case 'regard-ciel':
      // Simple style: no additional text, just the hashtag (already drawn in frame)
      break
      
    case 'regard-ciel-nom':
      // With name: Show saint name above the banner
      if (state.title) {
        ctx.fillStyle = '#ffffff'
        ctx.font = `bold ${titleSize}px ${fontFallback(titleFont)}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Add text shadow for visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        ctx.fillText(state.title, centerX, canvas.height - bannerHeight - 60)
        
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }
      break
      
    case 'regard-ciel-citation':
      // With quote: Show quote and author above the banner
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Add text shadow for visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      if (state.quote) {
        ctx.fillStyle = '#ffffff'
        ctx.font = `italic ${quoteSize}px ${fontFallback(quoteFont)}`
        wrapText(ctx, `"${state.quote}"`, centerX, canvas.height - bannerHeight - 120, 800, quoteSize * 1.3)
      }
      
      if (state.author) {
        ctx.fillStyle = '#ffd60a'
        ctx.font = `bold ${authorSize}px ${fontFallback(authorFont)}`
        ctx.fillText(`— ${state.author}`, centerX, canvas.height - bannerHeight - 40)
      }
      
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      break
  }
}

function drawEvangileText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, template: Template, state: CanvasState): void {
  const centerX = canvas.width / 2
  
  // Resolve custom fonts
  const titleFont = resolveFont('Playfair Display', state.customFontFamily)
  const quoteFont = resolveFont(template.quoteFont, state.customFontFamily)
  const refFont = resolveFont('Playfair Display', state.customFontFamily)
  const sizeOffset = state.fontSizeOffset
  
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  
  // Add strong text shadow for visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 1)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  
  // ============================================================
  // EVANGILE-SIMPLE: Titre de la scène + Verset (référence)
  // ============================================================
  if (template.frameStyle === 'evangile-simple') {
    const sTitleSize = resolveSize(32, sizeOffset)
    const sRefSize = resolveSize(24, sizeOffset)
    
    // Draw title
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${sTitleSize}px ${fontFallback(titleFont)}`
      ctx.fillText(state.title, centerX, canvas.height - 110)
    }
    
    // Draw reference (verset)
    if (state.author) {
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${sRefSize}px ${fontFallback(refFont)}`
      ctx.fillText(state.author, centerX, canvas.height - 60)
    }
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    return
  }
  
  // ============================================================
  // EVANGILE-VERSET: Titre + Extrait du texte + Verset (référence)
  // Layout from bottom: Reference -> Text -> Title (with proper spacing)
  // ============================================================
  if (template.frameStyle === 'evangile-verset') {
    const text = state.quote || ''
    const textLength = text.length
    
    // Dynamic font size based on verse length
    let verseFontSize = 18
    let verseLineHeight = 26
    let maxWidth = 900
    
    if (textLength > 300) {
      verseFontSize = 15
      verseLineHeight = 21
    } else if (textLength > 200) {
      verseFontSize = 16
      verseLineHeight = 23
    } else if (textLength > 100) {
      verseFontSize = 17
      verseLineHeight = 24
    }
    
    // Apply size offset
    verseFontSize = resolveSize(verseFontSize, sizeOffset)
    verseLineHeight = Math.max(verseFontSize + 3, verseLineHeight + sizeOffset)
    
    // Calculate text lines needed
    ctx.font = `italic ${verseFontSize}px ${fontFallback(quoteFont)}`
    const words = text.split(' ')
    let line = ''
    let verseLineCount = 0
    
    for (const word of words) {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line !== '') {
        verseLineCount++
        line = word + ' '
      } else {
        line = testLine
      }
    }
    if (line.trim()) verseLineCount++
    
    const verseTextHeight = verseLineCount * verseLineHeight
    
    // Position from bottom up
    const bottomMargin = 55
    const referenceY = canvas.height - bottomMargin
    const verseEndY = referenceY - 40 // Space between verse and reference
    const verseStartY = verseEndY - verseTextHeight
    const titleY = verseStartY - 90 // More space between title and verse
    
    const vTitleSize = resolveSize(24, sizeOffset)
    const vRefSize = resolveSize(22, sizeOffset)
    
    // Draw title (white, bold)
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${vTitleSize}px ${fontFallback(titleFont)}`
      ctx.fillText(state.title, centerX, titleY)
    }
    
    // Draw verse extract (white, italic)
    if (text) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.font = `italic ${verseFontSize}px ${fontFallback(quoteFont)}`
      wrapText(ctx, text, centerX, verseStartY, maxWidth, verseLineHeight)
    }
    
    // Draw reference (gold)
    if (state.author) {
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${vRefSize}px ${fontFallback(refFont)}`
      ctx.fillText(state.author, centerX, referenceY)
    }
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    return
  }
  
  // ============================================================
  // EVANGILE-NARRATIF: Titre + Texte complet + Verset (référence)
  // Simple top-down layout: Title at fixed position, then text, then reference
  // ============================================================
  if (template.frameStyle === 'evangile-narratif') {
    const text = state.quote || ''
    const textLength = text.length
    
    // FIXED POSITIONS - Simple and predictable
    const titleY = canvas.height * 0.38 // Title at 38% from top
    const textStartY = canvas.height * 0.46 // Text starts at 46% from top
    const referenceY = canvas.height - 50 // Reference at bottom
    
    // Dynamic font size based on text length
    let fontSize: number
    let lineHeight: number
    let maxWidth = 950
    
    if (textLength > 1200) {
      fontSize = 11
      lineHeight = 15
    } else if (textLength > 1000) {
      fontSize = 12
      lineHeight = 16
    } else if (textLength > 800) {
      fontSize = 13
      lineHeight = 17
    } else if (textLength > 600) {
      fontSize = 14
      lineHeight = 19
    } else if (textLength > 400) {
      fontSize = 15
      lineHeight = 21
    } else if (textLength > 200) {
      fontSize = 16
      lineHeight = 23
    } else {
      fontSize = 17
      lineHeight = 25
    }
    
    // Apply size offset
    fontSize = resolveSize(fontSize, sizeOffset)
    lineHeight = Math.max(fontSize + 3, lineHeight + sizeOffset)
    
    const nTitleSize = resolveSize(22, sizeOffset)
    const nRefSize = resolveSize(20, sizeOffset)
    const bodyFont = resolveFont('Inter', state.customFontFamily)
    
    // Draw title FIRST (white, bold) - at fixed top position
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${nTitleSize}px ${fontFallback(titleFont)}`
      ctx.fillText(state.title, centerX, titleY)
    }
    
    // Draw the full gospel text SECOND (white) - below title
    if (text) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
      ctx.font = `${fontSize}px ${fontFallback(bodyFont)}`
      wrapText(ctx, text, centerX, textStartY, maxWidth, lineHeight)
    }
    
    // Draw reference LAST (gold) - at fixed bottom position
    if (state.author) {
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${nRefSize}px ${fontFallback(refFont)}`
      ctx.fillText(state.author, centerX, canvas.height - 45)
    }
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    return
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

// Draw logo for "Un Regard au Ciel" style - top right with "VIE DES SAINTS" text
async function drawRegardCielLogo(ctx: CanvasRenderingContext2D, state: CanvasState): Promise<void> {
  const canvas = ctx.canvas
  const logoSize = 70
  const margin = 30
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

export function exportCanvasAsPNG(canvas: HTMLCanvasElement, type: string): void {
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().slice(0, 10)
  link.download = `${type}-${timestamp}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
}
