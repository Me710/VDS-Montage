import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image cache for canvas
const imageCache: Map<string, HTMLImageElement> = new Map()

export async function loadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(url, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line)
      line = words[i] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line)

  // Draw centered lines
  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, index) => {
    ctx.fillText(line.trim(), x, startY + (index * lineHeight))
  })
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.substr(1, 2), 16)
  const g = parseInt(hex.substr(3, 2), 16)
  const b = parseInt(hex.substr(5, 2), 16)
  return { r, g, b }
}

export function formatDate(): string {
  return new Date().toISOString().slice(0, 10)
}
