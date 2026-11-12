// Texte des templates classiques, et aiguillage vers les templates spécialisés.

import type { Template } from '../templates'
import { wrapText } from '../utils'
import type { CanvasState } from './types'
import { scaleMin, countWrappedLines, resolveFont, resolveSize, fontFallback } from './helpers'
import { drawRegardCielText } from './regard-ciel'
import { drawEvangileText } from './evangile'
import { drawHistoireText } from './histoire'

export function drawTextContent(ctx: CanvasRenderingContext2D, template: Template, state: CanvasState): void {
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

  // Handle "Vie des Saints" styles differently
  if (template.frameStyle.startsWith('histoire')) {
    drawHistoireText(ctx, canvas, template, state)
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

  const maxQuoteWidth = Math.round(canvas.width * 0.68)
  const quoteLineHeight = quoteSize * 1.4

  if (template.frameStyle === 'circular') {
    // Centre la citation ET l'auteur ensemble comme un groupe vertical
    // dans l'espace disponible entre la ligne décorative et le bas du cercle.
    const r = scaleMin(400, canvas)
    const padding = scaleMin(44, canvas)
    const gapAuthor = scaleMin(48, canvas)
    const availableTop = decorLineY + padding
    const availableBottom = centerY + r - padding

    const numLines = countWrappedLines(ctx, state.quote, maxQuoteWidth)
    const quoteBlockH = (numLines - 1) * quoteLineHeight

    if (state.author) {
      const groupH = quoteBlockH + gapAuthor + authorSize
      const groupStartY = (availableTop + availableBottom - groupH) / 2
      const quoteY = groupStartY + quoteBlockH / 2
      const authorY = groupStartY + quoteBlockH + gapAuthor + authorSize / 2

      wrapText(ctx, state.quote, centerX, quoteY, maxQuoteWidth, quoteLineHeight)
      ctx.font = `italic ${authorSize}px ${fontFallback(authorFont)}`
      ctx.fillText(`— ${state.author}`, centerX, authorY)
    } else {
      const quoteY = (availableTop + availableBottom) / 2
      wrapText(ctx, state.quote, centerX, quoteY, maxQuoteWidth, quoteLineHeight)
    }
  } else {
    wrapText(ctx, state.quote, centerX, centerY, maxQuoteWidth, quoteLineHeight)

    if (state.author) {
      const authorY = canvas.height - Math.round(canvas.height * 0.195)
      ctx.font = `italic ${authorSize}px ${fontFallback(authorFont)}`
      ctx.fillText(`— ${state.author}`, centerX, authorY)
    }
  }
}
