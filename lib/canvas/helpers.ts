// Aides communes : mise à l'échelle, polices, mesure du texte.

// Scale a base value (designed for 1024 min-dim) to the current canvas
export function scaleMin(base: number, canvas: HTMLCanvasElement): number {
  return Math.round(base * Math.min(canvas.width, canvas.height) / 1024)
}

// Count the number of wrapped lines for a given text and maxWidth
export function countWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number {
  const words = text.split(' ')
  let line = ''
  let count = 0
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      count++
      line = words[i] + ' '
    } else {
      line = testLine
    }
  }
  return count + 1
}
// ────────────────────────────────────────────────────────────────────────────

// Helper: resolve font family (custom override or template default)
export function resolveFont(templateFont: string, customFont: string): string {
  return customFont || templateFont
}

// Helper: resolve font size with offset (clamped to min 8px)
export function resolveSize(templateSize: number, offset: number): number {
  return Math.max(8, templateSize + offset)
}

// Helper: get font fallback string based on font family
export function fontFallback(font: string): string {
  const serifFonts = ['Playfair Display', 'Lora', 'Merriweather', 'Cinzel', 'Cormorant Garamond', 'Libre Baskerville']
  const scriptFonts = ['Dancing Script']
  if (scriptFonts.includes(font)) return `'${font}', cursive`
  if (serifFonts.includes(font)) return `'${font}', serif`
  return `'${font}', sans-serif`
}
