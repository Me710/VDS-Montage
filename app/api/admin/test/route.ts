import { NextRequest, NextResponse } from 'next/server'
import { ApiError, enforceRateLimit, handleRouteError, readJsonBody } from '@/lib/api-server'
import { requireAdmin } from '@/lib/admin-auth'
import { normalizeAiSettings } from '@/lib/ai/settings'
import { generateTextWith } from '@/lib/ai/text'
import { generateImageWith } from '@/lib/ai/image'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Teste un fournisseur AVANT de l'enregistrer, sans repli : l'erreur renvoyée
// est celle du fournisseur lui-même (clé refusée, modèle inconnu, quota...).
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request)
    enforceRateLimit(request, 'admin-test', 10)

    const body = await readJsonBody(request)
    const settings = normalizeAiSettings(body)
    const startedAt = Date.now()

    if (body.kind === 'text') {
      const text = await generateTextWith(
        settings,
        'Tu es un assistant concis. Réponds en français.',
        'Écris une seule phrase courte et inspirante sur la gratitude.'
      )
      return NextResponse.json({ kind: 'text', durationMs: Date.now() - startedAt, text: text.trim().slice(0, 400) })
    }

    if (body.kind === 'image') {
      const imageUrl = await generateImageWith(
        settings,
        'A serene mountain lake at golden hour, soft light, photorealistic. No text, no watermark.'
      )
      return NextResponse.json({ kind: 'image', durationMs: Date.now() - startedAt, imageUrl })
    }

    throw new ApiError(400, 'bad_request', 'Type de test inconnu.')
  } catch (error) {
    return handleRouteError(error, 'admin/test', 'Le test a échoué.')
  }
}
