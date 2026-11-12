// Lecture de fichiers image côté navigateur, avec validation explicite.

export class FileValidationError extends Error {}

interface ReadImageOptions {
  maxBytes: number
  acceptedTypes: string[]
}

export function readImageAsDataUrl(file: File, { maxBytes, acceptedTypes }: ReadImageOptions): Promise<string> {
  if (!acceptedTypes.includes(file.type)) {
    return Promise.reject(new FileValidationError('Format non pris en charge. Utilisez une image PNG, JPEG ou WebP.'))
  }
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024))
    return Promise.reject(new FileValidationError(`Image trop lourde (maximum ${maxMb} Mo).`))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new FileValidationError('Lecture du fichier impossible.'))
    }
    reader.onerror = () => reject(new FileValidationError('Lecture du fichier impossible.'))
    reader.readAsDataURL(file)
  })
}

// Déclenche le téléchargement d'un canvas en PNG. Utilise un Blob (plus léger
// et plus fiable qu'une data-URL pour les grandes images).
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Export du canvas impossible'))
      }, 'image/png', 1.0)
    } catch (error) {
      // SecurityError si le canvas contient une image sans en-têtes CORS
      reject(error)
    }
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
