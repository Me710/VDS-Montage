import { NextRequest, NextResponse } from 'next/server'
import { ApiError, enforceRateLimit, handleRouteError } from '@/lib/api-server'
import { requireAdmin } from '@/lib/admin-auth'
import { listModels } from '@/lib/ai/models'

export const dynamic = 'force-dynamic'

// GET /api/admin/models?provider=openrouter&kind=text
// Renvoie les modèles disponibles chez le fournisseur (sans aucun secret).
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request)
    enforceRateLimit(request, 'admin-models', 30)

    const provider = request.nextUrl.searchParams.get('provider') ?? ''
    const kind = request.nextUrl.searchParams.get('kind')
    if (kind !== 'text' && kind !== 'image') {
      throw new ApiError(400, 'bad_request', 'Type de modèle inconnu.')
    }

    return NextResponse.json({ models: await listModels(provider, kind) })
  } catch (error) {
    return handleRouteError(error, 'admin/models', 'Impossible de récupérer la liste des modèles.')
  }
}
