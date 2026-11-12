// Templates « Histoire » (vie des saints) : cadre et texte.

import type { Template } from '../templates'
import { wrapTextFromTop } from '../utils'
import type { CanvasState } from './types'
import { scaleMin, resolveFont, resolveSize, fontFallback } from './helpers'

// ── "Vie des Saints" frame styles ─────────────────────────────────────────────
export function drawHistoireFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string, state: CanvasState): void {
  const isLandscape = canvas.width > canvas.height

  if (style === 'histoire-classique') {
    // Full semi-transparent overlay with a decorative header band
    const headerHeight = Math.floor(canvas.height * 0.10)
    const footerStart = Math.floor(canvas.height * 0.36)

    // Dark overlay on the lower portion for text readability
    ctx.fillStyle = 'rgba(10, 20, 50, 0.88)'
    ctx.fillRect(0, footerStart, canvas.width, canvas.height - footerStart)

    // Gradient transition
    const grad = ctx.createLinearGradient(0, footerStart - Math.floor(canvas.height * 0.12), 0, footerStart)
    grad.addColorStop(0, 'rgba(10, 20, 50, 0)')
    grad.addColorStop(1, 'rgba(10, 20, 50, 0.88)')
    ctx.fillStyle = grad
    ctx.fillRect(0, footerStart - Math.floor(canvas.height * 0.12), canvas.width, Math.floor(canvas.height * 0.12))

    // Header band
    ctx.fillStyle = 'rgba(26, 58, 107, 0.85)'
    ctx.fillRect(0, 0, canvas.width, headerHeight)

    // Header bottom gold line
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.05, headerHeight)
    ctx.lineTo(canvas.width * 0.95, headerHeight)
    ctx.stroke()

    // Gold separator before text zone
    _drawHistoireSeparator(ctx, canvas, footerStart)

  } else if (style === 'histoire-fiche') {
    // Card at bottom, image visible at top
    const cardStart = isLandscape ? Math.floor(canvas.height * 0.45) : Math.floor(canvas.height * 0.42)
    const gradStart = cardStart - Math.floor(canvas.height * 0.15)

    ctx.fillStyle = 'rgba(8, 6, 3, 0.92)'
    ctx.fillRect(0, cardStart, canvas.width, canvas.height - cardStart)

    const grad = ctx.createLinearGradient(0, gradStart, 0, cardStart)
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    grad.addColorStop(1, 'rgba(8, 6, 3, 0.92)')
    ctx.fillStyle = grad
    ctx.fillRect(0, gradStart, canvas.width, cardStart - gradStart)

    _drawHistoireSeparator(ctx, canvas, cardStart)

  } else if (style === 'histoire-portrait') {
    // Elegant side gradient — bottom-heavy for text
    const gradStart = Math.floor(canvas.height * 0.35)

    const grad = ctx.createLinearGradient(0, gradStart, 0, canvas.height)
    grad.addColorStop(0, 'rgba(0, 0, 30, 0)')
    grad.addColorStop(0.3, 'rgba(30, 0, 60, 0.5)')
    grad.addColorStop(0.6, 'rgba(20, 0, 50, 0.8)')
    grad.addColorStop(1, 'rgba(10, 0, 30, 0.95)')
    ctx.fillStyle = grad
    ctx.fillRect(0, gradStart, canvas.width, canvas.height - gradStart)

    // Top subtle gradient for title
    const topGrad = ctx.createLinearGradient(0, 0, 0, Math.floor(canvas.height * 0.15))
    topGrad.addColorStop(0, 'rgba(0, 0, 20, 0.7)')
    topGrad.addColorStop(1, 'rgba(0, 0, 20, 0)')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, canvas.width, Math.floor(canvas.height * 0.15))

    // Gold decorative line
    const lineY = Math.floor(canvas.height * 0.48)
    _drawHistoireSeparator(ctx, canvas, lineY)
  }
}

export function _drawHistoireSeparator(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, y: number): void {
  const padH = canvas.width * 0.08
  ctx.save()
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(padH, y)
  ctx.lineTo(canvas.width - padH, y)
  ctx.stroke()
  // Small cross at center
  const d = scaleMin(8, canvas)
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2, y - d)
  ctx.lineTo(canvas.width / 2, y + d)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(canvas.width / 2 - d, y)
  ctx.lineTo(canvas.width / 2 + d, y)
  ctx.stroke()
  ctx.restore()
}

export function drawHistoireText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, template: Template, state: CanvasState): void {
  const centerX = canvas.width / 2
  const sizeOffset = state.fontSizeOffset
  const isLandscape = canvas.width > canvas.height

  const titleFont = resolveFont(template.titleFont, state.customFontFamily)
  const bodyFont = resolveFont(template.quoteFont, state.customFontFamily)
  const authorFont = resolveFont(template.authorFont, state.customFontFamily)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  ctx.shadowColor = 'rgba(0, 0, 0, 1)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  const maxWidth = Math.round(canvas.width * 0.88)

  // ── HISTOIRE-CLASSIQUE ──────────────────────────────────────────
  if (template.frameStyle === 'histoire-classique') {
    const headerHeight = Math.floor(canvas.height * 0.10)
    const titleSize = resolveSize(template.titleSize, sizeOffset)
    const bodySize = resolveSize(template.quoteSize, sizeOffset)
    const dateSize = resolveSize(template.authorSize, sizeOffset)

    // "VIE DES SAINTS" in header
    const labelSize = resolveSize(16, sizeOffset)
    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)'
    ctx.font = `bold ${labelSize}px ${fontFallback('Inter')}`
    ctx.fillText('VIE DES SAINTS', centerX, (headerHeight - labelSize) / 2)

    // Saint name (title) — below header
    let currentY = headerHeight + Math.max(14, scaleMin(20, canvas))
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${titleSize}px ${fontFallback(titleFont)}`
      currentY = wrapTextFromTop(ctx, state.title, centerX, currentY, maxWidth, Math.round(titleSize * 1.3))
      currentY += Math.max(4, scaleMin(8, canvas))
    }

    // Dates (author) — just below title in gold
    if (state.author) {
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${dateSize}px ${fontFallback(authorFont)}`
      ctx.fillText(state.author, centerX, currentY)
      currentY += dateSize + Math.max(12, scaleMin(18, canvas))
    }

    // Biography text — start right after separator, go close to bottom
    const separatorY = Math.floor(canvas.height * 0.38)
    const bioStartY = separatorY + Math.max(14, scaleMin(20, canvas))
    const bioEndY = canvas.height - Math.max(20, scaleMin(30, canvas))

    if (state.quote && bioStartY < bioEndY) {
      const text = state.quote
      const availableHeight = bioEndY - bioStartY

      // Dynamic font sizing based on available space and text length
      let fontSize: number
      let lineHeight: number

      if (text.length > 550) { fontSize = resolveSize(17, sizeOffset); lineHeight = 25 }
      else if (text.length > 450) { fontSize = resolveSize(19, sizeOffset); lineHeight = 27 }
      else if (text.length > 350) { fontSize = resolveSize(20, sizeOffset); lineHeight = 29 }
      else if (text.length > 250) { fontSize = resolveSize(21, sizeOffset); lineHeight = 30 }
      else { fontSize = bodySize; lineHeight = Math.round(bodySize * 1.45) }

      // Shrink if text wouldn't fit
      const estimatedLines = Math.ceil(text.length / Math.floor(maxWidth / (fontSize * 0.55)))
      const estimatedHeight = estimatedLines * lineHeight
      if (estimatedHeight > availableHeight && estimatedLines > 0) {
        const ratio = availableHeight / estimatedHeight
        fontSize = Math.max(13, Math.floor(fontSize * ratio))
        lineHeight = Math.max(fontSize + 4, Math.floor(lineHeight * ratio))
      }

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, bioStartY, canvas.width, availableHeight)
      ctx.clip()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.font = `${fontSize}px ${fontFallback(bodyFont)}`
      wrapTextFromTop(ctx, text, centerX, bioStartY, maxWidth, lineHeight)

      ctx.restore()
    }

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    return
  }

  // ── HISTOIRE-FICHE ──────────────────────────────────────────────
  if (template.frameStyle === 'histoire-fiche') {
    const cardStart = isLandscape ? Math.floor(canvas.height * 0.45) : Math.floor(canvas.height * 0.42)
    const titleSize = resolveSize(template.titleSize, sizeOffset)
    const bodySize = resolveSize(template.quoteSize, sizeOffset)
    const dateSize = resolveSize(template.authorSize, sizeOffset)
    const padTop = Math.max(14, scaleMin(20, canvas))

    let currentY = cardStart + padTop

    // Saint name (title)
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${titleSize}px ${fontFallback(titleFont)}`
      currentY = wrapTextFromTop(ctx, state.title, centerX, currentY, maxWidth, Math.round(titleSize * 1.3))
      currentY += Math.max(4, scaleMin(6, canvas))
    }

    // Dates in gold
    if (state.author) {
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${dateSize}px ${fontFallback(authorFont)}`
      ctx.fillText(state.author, centerX, currentY)
      currentY += dateSize + Math.max(12, scaleMin(16, canvas))
    }

    // Biography text
    const bioEndY = canvas.height - Math.max(20, scaleMin(30, canvas))

    if (state.quote && currentY < bioEndY) {
      const text = state.quote
      const availableHeight = bioEndY - currentY
      let fontSize = bodySize
      let lineHeight = Math.round(fontSize * 1.45)

      if (text.length > 550) { fontSize = resolveSize(16, sizeOffset); lineHeight = 23 }
      else if (text.length > 450) { fontSize = resolveSize(17, sizeOffset); lineHeight = 24 }
      else if (text.length > 350) { fontSize = resolveSize(18, sizeOffset); lineHeight = 26 }
      else if (text.length > 250) { fontSize = resolveSize(19, sizeOffset); lineHeight = 27 }

      const estimatedLines = Math.ceil(text.length / Math.floor(maxWidth / (fontSize * 0.55)))
      const estimatedHeight = estimatedLines * lineHeight
      if (estimatedHeight > availableHeight && estimatedLines > 0) {
        const ratio = availableHeight / estimatedHeight
        fontSize = Math.max(13, Math.floor(fontSize * ratio))
        lineHeight = Math.max(fontSize + 4, Math.floor(lineHeight * ratio))
      }

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, currentY, canvas.width, availableHeight)
      ctx.clip()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
      ctx.font = `${fontSize}px ${fontFallback(bodyFont)}`
      wrapTextFromTop(ctx, text, centerX, currentY, maxWidth, lineHeight)

      ctx.restore()
    }

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    return
  }

  // ── HISTOIRE-PORTRAIT ───────────────────────────────────────────
  if (template.frameStyle === 'histoire-portrait') {
    const titleSize = resolveSize(template.titleSize, sizeOffset)
    const bodySize = resolveSize(template.quoteSize, sizeOffset)
    const dateSize = resolveSize(template.authorSize, sizeOffset)

    // Title at the top
    let titleY = Math.max(20, scaleMin(28, canvas))
    if (state.title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${titleSize}px ${fontFallback(titleFont)}`
      titleY = wrapTextFromTop(ctx, state.title, centerX, titleY, maxWidth, Math.round(titleSize * 1.3))
    }

    // Content in lower portion
    const contentStartY = Math.floor(canvas.height * 0.50)
    let currentY = contentStartY

    // Dates in gold
    if (state.author) {
      ctx.fillStyle = 'rgba(212, 175, 55, 1)'
      ctx.font = `italic ${dateSize}px ${fontFallback(authorFont)}`
      ctx.fillText(state.author, centerX, currentY)
      currentY += dateSize + Math.max(12, scaleMin(16, canvas))
    }

    // Biography text
    const bioEndY = canvas.height - Math.max(20, scaleMin(30, canvas))

    if (state.quote && currentY < bioEndY) {
      const text = state.quote
      const availableHeight = bioEndY - currentY
      let fontSize = bodySize
      let lineHeight = Math.round(fontSize * 1.45)

      if (text.length > 550) { fontSize = resolveSize(16, sizeOffset); lineHeight = 23 }
      else if (text.length > 450) { fontSize = resolveSize(17, sizeOffset); lineHeight = 24 }
      else if (text.length > 350) { fontSize = resolveSize(18, sizeOffset); lineHeight = 26 }
      else if (text.length > 250) { fontSize = resolveSize(19, sizeOffset); lineHeight = 27 }

      const estimatedLines = Math.ceil(text.length / Math.floor(maxWidth / (fontSize * 0.55)))
      const estimatedHeight = estimatedLines * lineHeight
      if (estimatedHeight > availableHeight && estimatedLines > 0) {
        const ratio = availableHeight / estimatedHeight
        fontSize = Math.max(13, Math.floor(fontSize * ratio))
        lineHeight = Math.max(fontSize + 4, Math.floor(lineHeight * ratio))
      }

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, currentY, canvas.width, availableHeight)
      ctx.clip()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.font = `${fontSize}px ${fontFallback(bodyFont)}`
      wrapTextFromTop(ctx, text, centerX, currentY, maxWidth, lineHeight)

      ctx.restore()
    }

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    return
  }
}
// ────────────────────────────────────────────────────────────────────────────
