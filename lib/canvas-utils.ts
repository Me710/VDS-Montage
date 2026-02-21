import { Template, FrameStyle } from './templates'
import { loadImage, wrapText, wrapTextFromTop, hexToRgb } from './utils'

// ─── Format support ─────────────────────────────────────────────────────────
export type CanvasFormat = '1:1' | '16:9' | '9:16'

export const CANVAS_DIMENSIONS: Record<CanvasFormat, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1024, height: 576 },
  '9:16': { width: 576, height: 1024 },
}

// Scale a base value (designed for 1024 min-dim) to the current canvas
function scaleMin(base: number, canvas: HTMLCanvasElement): number {
  return Math.round(base * Math.min(canvas.width, canvas.height) / 1024)
}
// ────────────────────────────────────────────────────────────────────────────

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
  const r1 = scaleMin(400, canvas)
  const r2 = scaleMin(420, canvas)
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, r1, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2, r2, 0, Math.PI * 2)
  ctx.stroke()
}

function drawGeometricFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: CanvasState): void {
  const margin = scaleMin(60, canvas)
  const logo = getLogoPosition(canvas)

  drawFrameWithLogoCutout(ctx, canvas, margin, logo, state.frameColor)

  const cornerSize = scaleMin(40, canvas)
  ctx.lineWidth = 6
  drawCornerDecoration(ctx, margin, margin, cornerSize)
  drawCornerDecoration(ctx, canvas.width - margin, margin, cornerSize, true)
  drawCornerDecoration(ctx, margin, canvas.height - margin, cornerSize, false, true)
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
  const margin = scaleMin(50, canvas)
  const logo = getLogoPosition(canvas)

  ctx.lineWidth = 10
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, state.frameColor)

  ctx.lineWidth = 4
  drawFrameWithLogoCutout(ctx, canvas, margin + scaleMin(20, canvas), logo, state.frameColor)

  const cornerPositions = [
    { x: margin, y: margin },
    { x: canvas.width - margin, y: margin },
    { x: margin, y: canvas.height - margin },
  ]
  cornerPositions.forEach(pos => {
    ctx.save()
    ctx.translate(pos.x, pos.y)
    ctx.fillStyle = state.frameColor
    ctx.beginPath()
    ctx.arc(0, 0, scaleMin(8, canvas), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function drawSacredGeometryFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const r = scaleMin(380, canvas)

  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - r)
  ctx.lineTo(centerX + r, centerY)
  ctx.lineTo(centerX, centerY + r)
  ctx.lineTo(centerX - r, centerY)
  ctx.closePath()
  ctx.stroke()
}

function drawElegantFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  const margin = scaleMin(70, canvas)
  const logo = getLogoPosition(canvas)
  const frameColor = ctx.strokeStyle as string

  ctx.lineWidth = 6
  drawFrameWithLogoCutout(ctx, canvas, margin, logo, frameColor)

  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6
  drawFrameWithLogoCutout(ctx, canvas, margin + scaleMin(15, canvas), logo, frameColor)
  ctx.globalAlpha = 1.0
}

// "Un Regard au Ciel" frame style - green banner at bottom with yellow hashtag
function drawRegardCielFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string): void {
  const bannerHeight = Math.max(60, scaleMin(100, canvas))
  const bannerY = canvas.height - bannerHeight

  ctx.fillStyle = '#2d6a4f'
  ctx.fillRect(0, bannerY, canvas.width, bannerHeight)

  ctx.fillStyle = '#ffd60a'
  ctx.font = `italic bold ${scaleMin(52, canvas)}px Playfair Display, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('#UnRegardAuCiel', canvas.width / 2, bannerY + bannerHeight / 2)
}

function drawEvangileFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string): void {
  const isLandscape = canvas.width > canvas.height

  if (style === 'evangile-narratif') {
    // Pour le format 16:9, on utilise un ratio plus généreux pour l'image
    const solidRatio = isLandscape ? 0.48 : 0.44
    const gradRatio  = isLandscape ? 0.32 : 0.30

    const solidStart = Math.floor(canvas.height * solidRatio)
    const gradStart  = Math.floor(canvas.height * gradRatio)

    // Fond solide pour la zone de texte
    ctx.fillStyle = 'rgba(8, 6, 3, 0.92)'
    ctx.fillRect(0, solidStart, canvas.width, canvas.height - solidStart)

    // Gradient de transition
    const grad = ctx.createLinearGradient(0, gradStart, 0, solidStart)
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    grad.addColorStop(1, 'rgba(8, 6, 3, 0.92)')
    ctx.fillStyle = grad
    ctx.fillRect(0, gradStart, canvas.width, solidStart - gradStart)

    // Ligne décorative dorée à la jonction image / texte
    _drawEvangileSeparator(ctx, canvas, solidStart)

  } else if (style === 'evangile-verset') {
    const solidRatio = isLandscape ? 0.54 : 0.58
    const gradRatio  = isLandscape ? 0.38 : 0.46

    const solidStart = Math.floor(canvas.height * solidRatio)
    const gradStart  = Math.floor(canvas.height * gradRatio)

    ctx.fillStyle = 'rgba(8, 6, 3, 0.90)'
    ctx.fillRect(0, solidStart, canvas.width, canvas.height - solidStart)

    const grad = ctx.createLinearGradient(0, gradStart, 0, solidStart)
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    grad.addColorStop(1, 'rgba(8, 6, 3, 0.90)')
    ctx.fillStyle = grad
    ctx.fillRect(0, gradStart, canvas.width, solidStart - gradStart)

    // Ligne décorative dorée
    _drawEvangileSeparator(ctx, canvas, solidStart)

  } else {
    // evangile-simple : gradient du bas
    const gradStart = Math.floor(canvas.height * 0.72)
    const grad = ctx.createLinearGradient(0, gradStart, 0, canvas.height)
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    grad.addColorStop(0.3, 'rgba(10, 8, 5, 0.65)')
    grad.addColorStop(0.65, 'rgba(10, 8, 5, 0.88)')
    grad.addColorStop(1, 'rgba(8, 6, 3, 0.97)')
    ctx.fillStyle = grad
    ctx.fillRect(0, gradStart, canvas.width, canvas.height - gradStart)
  }
}

// Ligne décorative dorée à la jonction image / zone de texte
function _drawEvangileSeparator(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, y: number): void {
  const padH = canvas.width * 0.06
  ctx.save()
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padH, y)
  ctx.lineTo(canvas.width - padH, y)
  ctx.stroke()
  // Petit losange centré sur la ligne
  const d = scaleMin(6, canvas)
  ctx.fillStyle = 'rgba(212, 175, 55, 0.70)'
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2, y - d)
  ctx.lineTo(canvas.width / 2 + d, y)
  ctx.lineTo(canvas.width / 2, y + d)
  ctx.lineTo(canvas.width / 2 - d, y)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
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

  const titleFont = resolveFont(template.titleFont, state.customFontFamily)
  const quoteFont = resolveFont(template.quoteFont, state.customFontFamily)
  const authorFont = resolveFont(template.authorFont, state.customFontFamily)
  const titleSize = resolveSize(template.titleSize, state.fontSizeOffset)
  const quoteSize = resolveSize(template.quoteSize, state.fontSizeOffset)
  const authorSize = resolveSize(template.authorSize, state.fontSizeOffset)

  // Title — proportional Y position
  const titleY    = Math.round(canvas.height * 0.195)
  const decorLineY = Math.round(canvas.height * 0.234)
  const decorLineW = Math.round(canvas.width  * 0.195)

  ctx.font = `${titleSize}px ${fontFallback(titleFont)}`
  ctx.fillText(state.title, centerX, titleY)

  ctx.fillStyle = state.frameColor
  ctx.fillRect(centerX - decorLineW / 2, decorLineY, decorLineW, 3)

  ctx.fillStyle = state.textColor
  ctx.font = `${quoteSize}px ${fontFallback(quoteFont)}`
  wrapText(ctx, state.quote, centerX, centerY, Math.round(canvas.width * 0.68), quoteSize * 1.4)

  if (state.author) {
    let authorY: number

    if (template.frameStyle === 'circular') {
      // L'auteur doit être DANS le cercle, juste au-dessus de son bord inférieur.
      // Rayon du cercle interne (identique à drawCircularFrame) = scaleMin(400, canvas).
      const r = scaleMin(400, canvas)
      // Position : centre + rayon - (hauteur texte + marge)
      authorY = centerY + r - authorSize - scaleMin(18, canvas)
    } else {
      authorY = canvas.height - Math.round(canvas.height * 0.195)
    }

    ctx.font = `italic ${authorSize}px ${fontFallback(authorFont)}`
    ctx.fillText(`— ${state.author}`, centerX, authorY)
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
        wrapText(ctx, `"${state.quote}"`, centerX, canvas.height - bannerHeight - 120, Math.round(canvas.width * 0.78), quoteSize * 1.3)
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
    
    // Draw title (wrappé)
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${sTitleSize}px ${fontFallback(titleFont)}`
      const sMaxWidth = Math.round(canvas.width * 0.90)
      const sTitleLH  = Math.round(sTitleSize * 1.3)
      const sTitleY   = canvas.height - Math.max(90, scaleMin(130, canvas))
      wrapTextFromTop(ctx, state.title, centerX, sTitleY, sMaxWidth, sTitleLH)
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
    
    // Taille de police dynamique — minimum 17px pour rester lisible
    let verseFontSize = 22
    let verseLineHeight = 30
    const maxWidth = Math.round(canvas.width * 0.88)

    if (textLength > 300) {
      verseFontSize = 17
      verseLineHeight = 24
    } else if (textLength > 200) {
      verseFontSize = 19
      verseLineHeight = 26
    } else if (textLength > 100) {
      verseFontSize = 21
      verseLineHeight = 28
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
    
    // Position from bottom up — valeurs scalées selon la dimension min
    const bottomMargin = Math.max(40, scaleMin(55, canvas))
    const referenceY  = canvas.height - bottomMargin
    const verseEndY   = referenceY - Math.max(28, scaleMin(40, canvas))
    const verseStartY = verseEndY - verseTextHeight
    const titleY      = verseStartY - Math.max(55, scaleMin(90, canvas))
    
    const vTitleSize = resolveSize(28, sizeOffset)
    const vRefSize = resolveSize(22, sizeOffset)
    
    // Draw title (white, bold — wrappé pour éviter le débordement)
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${vTitleSize}px ${fontFallback(titleFont)}`
      wrapTextFromTop(ctx, state.title, centerX, titleY, maxWidth, Math.round(vTitleSize * 1.35))
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
  // EVANGILE-NARRATIF: layout top-down strict, avec clipping
  // Titre → Corps (clippé) → Référence fixe en bas
  // ============================================================
  if (template.frameStyle === 'evangile-narratif') {
    const text = state.quote || ''
    const textLength = text.length
    const isLandscape = canvas.width > canvas.height

    const solidRatio  = isLandscape ? 0.48 : 0.44
    const maxWidth    = Math.round(canvas.width * 0.90)
    const padTop      = Math.max(14, scaleMin(20, canvas))
    const padBottom   = Math.max(10, scaleMin(14, canvas))
    const refHeight   = resolveSize(22, sizeOffset) * 1.6
    const referenceY  = canvas.height - Math.max(40, scaleMin(50, canvas))
    // Limite basse pour le corps du texte (laisse de la place à la référence)
    const bodyBottomY = referenceY - refHeight - padBottom

    // Point de départ dans la zone solide
    let currentY = Math.floor(canvas.height * solidRatio) + padTop

    ctx.save()
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'top'
    ctx.shadowColor  = 'rgba(0, 0, 0, 1)'
    ctx.shadowBlur   = 12
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // ── Titre (wrappé, taille fixe) ──────────────────────────────
    const nTitleSize = resolveSize(26, sizeOffset)
    const titleLH    = Math.round(nTitleSize * 1.35)
    const nRefSize   = resolveSize(22, sizeOffset)
    const bodyFont   = resolveFont('Inter', state.customFontFamily)

    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${nTitleSize}px ${fontFallback(titleFont)}`
      currentY = wrapTextFromTop(ctx, state.title, centerX, currentY, maxWidth, titleLH)
      // Fine ligne dorée sous le titre
      ctx.save()
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur  = 0
      ctx.fillStyle   = 'rgba(212, 175, 55, 0.6)'
      const lineW = Math.round(canvas.width * 0.40)
      ctx.fillRect(centerX - lineW / 2, currentY + 6, lineW, 1)
      ctx.restore()
      currentY += Math.max(14, scaleMin(20, canvas))
    }

    // ── Corps du texte — clippé pour ne jamais dépasser bodyBottomY ──
    if (text && currentY < bodyBottomY) {
      let fontSize: number
      let lineHeight: number

      if (textLength > 1200) {
        fontSize = 14; lineHeight = 20
      } else if (textLength > 1000) {
        fontSize = 15; lineHeight = 21
      } else if (textLength > 800) {
        fontSize = 16; lineHeight = 22
      } else if (textLength > 600) {
        fontSize = 17; lineHeight = 24
      } else if (textLength > 400) {
        fontSize = 18; lineHeight = 26
      } else if (textLength > 200) {
        fontSize = 20; lineHeight = 28
      } else {
        fontSize = 22; lineHeight = 30
      }

      fontSize   = resolveSize(fontSize, sizeOffset)
      lineHeight = Math.max(fontSize + 4, lineHeight + sizeOffset)

      // Réduire fontSize si le texte ne tiendrait pas dans l'espace dispo
      const availableHeight = bodyBottomY - currentY
      const estimatedLines  = Math.ceil(textLength / Math.floor(maxWidth / (fontSize * 0.6)))
      const estimatedHeight = estimatedLines * lineHeight
      if (estimatedHeight > availableHeight && estimatedLines > 0) {
        const ratio = availableHeight / estimatedHeight
        fontSize   = Math.max(11, Math.floor(fontSize * ratio))
        lineHeight = Math.max(fontSize + 3, Math.floor(lineHeight * ratio))
      }

      // Clipper le canvas pour que le texte ne sorte pas de la zone allouée
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, currentY, canvas.width, bodyBottomY - currentY)
      ctx.clip()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
      ctx.font = `${fontSize}px ${fontFallback(bodyFont)}`
      wrapTextFromTop(ctx, text, centerX, currentY, maxWidth, lineHeight)

      ctx.restore()
    }

    // ── Référence dorée — position fixe en bas ────────────────────
    if (state.author) {
      ctx.shadowColor  = 'rgba(0, 0, 0, 0.9)'
      ctx.shadowBlur   = 8
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${nRefSize}px ${fontFallback(refFont)}`
      ctx.fillText(state.author, centerX, referenceY)
    }

    ctx.restore()
    return
  }
}

// Default VDS logo path
const DEFAULT_LOGO_PATH = '/images/logo-vds.png'

// Logo configuration — scales with canvas min-dimension
function getLogoConfig(canvas: HTMLCanvasElement) {
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
function getLogoPosition(canvas: HTMLCanvasElement) {
  const cfg = getLogoConfig(canvas)
  return {
    x: canvas.width - cfg.marginRight,
    y: canvas.height - cfg.marginBottom,
    size: cfg.size,
    radius: cfg.size / 2 + cfg.cutoutPadding,
  }
}

async function drawLogo(ctx: CanvasRenderingContext2D, state: CanvasState): Promise<void> {
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

// Draw logo for "Un Regard au Ciel" style - top right
async function drawRegardCielLogo(ctx: CanvasRenderingContext2D, state: CanvasState): Promise<void> {
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

export function exportCanvasAsPNG(canvas: HTMLCanvasElement, type: string): void {
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().slice(0, 10)
  link.download = `${type}-${timestamp}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
}
