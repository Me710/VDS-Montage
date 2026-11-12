// Templates « L'Évangile Illustré » : cadre et texte.

import type { Template } from '../templates'
import { wrapText, wrapTextFromTop } from '../utils'
import type { CanvasState } from './types'
import { scaleMin, resolveFont, resolveSize, fontFallback } from './helpers'

export function drawEvangileFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string): void {
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
export function _drawEvangileSeparator(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, y: number): void {
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

export function drawEvangileText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, template: Template, state: CanvasState): void {
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
