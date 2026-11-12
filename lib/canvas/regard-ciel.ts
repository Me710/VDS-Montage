// Templates « Un Regard au Ciel » : cadre et texte.

import type { Template } from '../templates'
import { wrapText } from '../utils'
import type { CanvasState } from './types'
import { scaleMin, resolveFont, resolveSize, fontFallback } from './helpers'

// "Un Regard au Ciel" frame style - green banner at bottom with yellow hashtag
export function drawRegardCielFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, style: string): void {
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

export function drawRegardCielText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, template: Template, state: CanvasState): void {
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
