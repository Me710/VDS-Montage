import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cache d'images pour le canvas, borné : les images générées sont des data-URL
// volumineuses, un cache illimité ferait grossir la mémoire à chaque génération.
const IMAGE_CACHE_LIMIT = 12
const IMAGE_LOAD_TIMEOUT_MS = 20_000
const imageCache: Map<string, HTMLImageElement> = new Map()

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url)
  if (cached) {
    // Rafraîchit la position (éviction du moins récemment utilisé)
    imageCache.delete(url)
    imageCache.set(url, cached)
    return cached
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = ''
      reject(new Error('Image load timed out'))
    }, IMAGE_LOAD_TIMEOUT_MS)

    // crossOrigin n'a de sens que pour les URL distantes
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      clearTimeout(timer)
      imageCache.set(url, img)
      if (imageCache.size > IMAGE_CACHE_LIMIT) {
        const oldest = imageCache.keys().next().value
        if (oldest !== undefined) imageCache.delete(oldest)
      }
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error('Image failed to load'))
    }
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

/**
 * Dessine du texte à partir de y vers le bas (textBaseline='top').
 * Retourne la coordonnée Y du bas du dernier trait.
 */
export function wrapTextFromTop(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ')
  let line = ''
  const lines: string[] = []

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      lines.push(line.trim())
      line = words[i] + ' '
    } else {
      line = testLine
    }
  }
  if (line.trim()) lines.push(line.trim())

  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight)
  })

  return y + lines.length * lineHeight
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Accepte #rgb et #rrggbb ; retombe sur le noir si la valeur est invalide
  let value = hex.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value.split('').map((c) => c + c).join('')
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) {
    return { r: 0, g: 0, b: 0 }
  }
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

export function formatDate(): string {
  return new Date().toISOString().slice(0, 10)
}
