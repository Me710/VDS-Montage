import { NextRequest, NextResponse } from 'next/server'
import { sendImageToTelegram } from '@/lib/telegram'
import { ApiError, enforceRateLimit, handleRouteError, readJsonBody } from '@/lib/api-server'

export const dynamic = 'force-dynamic'

const DEFAULT_CAPTION = '📸 VDS Montage - Nouvelle création'

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(request, 'telegram', 10)

    const body = await readJsonBody(request)
    if (typeof body.image !== 'string' || !body.image) {
      throw new ApiError(400, 'bad_request', 'Aucune image fournie.')
    }
    const caption = typeof body.caption === 'string' && body.caption.trim() ? body.caption : DEFAULT_CAPTION

    await sendImageToTelegram(body.image, caption)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleRouteError(error, 'telegram', "L'envoi vers Telegram a échoué. Merci de réessayer.")
  }
}
