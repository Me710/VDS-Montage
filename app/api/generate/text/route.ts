import { NextRequest, NextResponse } from 'next/server'
import { generateQuoteAndAuthor, isContentType } from '@/lib/text-generation'
import { ApiError, enforceRateLimit, handleRouteError, readJsonBody } from '@/lib/api-server'

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0
// Le service gratuit impose un délai entre deux requêtes : on laisse le temps aux retries
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    enforceRateLimit(request, 'generate-text', 12)

    const body = await readJsonBody(request)
    if (!isContentType(body.type)) {
      throw new ApiError(400, 'bad_request', 'Type de publication inconnu.')
    }

    const content = await generateQuoteAndAuthor(body.type)
    return NextResponse.json(content)
  } catch (error) {
    return handleRouteError(
      error,
      'generate/text',
      'Le service de génération de texte est momentanément indisponible. Réessayez dans quelques secondes.'
    )
  }
}
