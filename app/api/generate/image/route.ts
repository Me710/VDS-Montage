import { NextRequest, NextResponse } from 'next/server'
import { generateBackgroundImage } from '@/lib/pollinations'
import { isContentType } from '@/lib/text-generation'
import { ApiError, enforceRateLimit, handleRouteError, readJsonBody } from '@/lib/api-server'

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0
// La génération d'image peut prendre du temps (file d'attente du service gratuit)
export const maxDuration = 120

const MAX_STYLE_LENGTH = 60
const MAX_CONTEXT_LENGTH = 200

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(request, 'generate-image', 8)

    const body = await readJsonBody(request)
    if (!isContentType(body.type)) {
      throw new ApiError(400, 'bad_request', 'Type de publication inconnu.')
    }

    // Les champs libres sont bornés : ils sont insérés dans le prompt d'image
    const style = typeof body.style === 'string' && body.style.trim()
      ? body.style.trim().slice(0, MAX_STYLE_LENGTH)
      : 'beautiful'
    const context = typeof body.context === 'string' && body.context.trim()
      ? body.context.trim().slice(0, MAX_CONTEXT_LENGTH)
      : undefined

    const imageUrl = await generateBackgroundImage(body.type, style, context)
    return NextResponse.json({ imageUrl })
  } catch (error) {
    return handleRouteError(
      error,
      'generate/image',
      "Le service de génération d'image est momentanément indisponible. Réessayez dans quelques secondes."
    )
  }
}
