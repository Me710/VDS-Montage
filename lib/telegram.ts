import { ApiError, fetchWithTimeout } from './api-server'

const MAX_CAPTION_LENGTH = 1024 // limite de l'API Telegram pour sendPhoto
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // limite de l'API Telegram pour une photo

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

// Envoie l'image sur le canal Telegram configuré. Lève une ApiError explicite
// en cas d'échec (configuration absente, image invalide, refus de Telegram).
export async function sendImageToTelegram(imageDataUrl: string, caption: string): Promise<void> {
  // Lus à chaque appel : un changement de variable prend effet sans rebuild
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    throw new ApiError(503, 'not_configured', "La sauvegarde Telegram n'est pas configurée sur ce serveur.")
  }

  const match = DATA_URL_PATTERN.exec(imageDataUrl)
  if (!match) {
    throw new ApiError(400, 'bad_request', 'Image invalide.')
  }

  const [, mimeType, base64Data] = match
  const buffer = Buffer.from(base64Data, 'base64')
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    throw new ApiError(400, 'bad_request', 'Image trop lourde pour Telegram (maximum 10 Mo).')
  }

  const formData = new FormData()
  formData.append('chat_id', chatId)
  formData.append('photo', new Blob([buffer], { type: mimeType }), 'vds-montage.png')
  formData.append('caption', caption.slice(0, MAX_CAPTION_LENGTH))

  let response: Response
  try {
    response = await fetchWithTimeout(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: 'POST', body: formData },
      30_000
    )
  } catch {
    // Ne jamais journaliser l'URL : elle contient le jeton du bot
    throw new ApiError(502, 'upstream_error', 'Telegram ne répond pas. Réessayez dans un instant.')
  }

  if (!response.ok) {
    const details = await response.json().catch(() => null) as { description?: string } | null
    console.error('[telegram] API error:', response.status, details?.description ?? '')
    throw new ApiError(502, 'upstream_error', "Telegram a refusé l'image. Vérifiez la configuration du bot.")
  }
}
