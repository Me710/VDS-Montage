import { NextRequest, NextResponse } from 'next/server'
import { ApiError, handleRouteError, readJsonBody } from '@/lib/api-server'
import { isAdminConfigured, isAdminRequest, requireAdmin } from '@/lib/admin-auth'
import { isDatabaseConfigured } from '@/lib/db'
import { getProvider, isProviderConfigured, listProviderSummaries } from '@/lib/ai/providers'
import { getAiSettings, normalizeAiSettings, saveAiSettings } from '@/lib/ai/settings'

export const dynamic = 'force-dynamic'

// GET : état de la session + réglages et catalogue (sans aucun secret).
export async function GET(request: NextRequest) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json({ adminConfigured: false, authenticated: false })
    }
    if (!isAdminRequest(request)) {
      return NextResponse.json({ adminConfigured: true, authenticated: false })
    }

    return NextResponse.json({
      adminConfigured: true,
      authenticated: true,
      databaseConfigured: isDatabaseConfigured(),
      settings: await getAiSettings(),
      providers: listProviderSummaries(),
    })
  } catch (error) {
    return handleRouteError(error, 'admin/settings', 'Impossible de charger les réglages.')
  }
}

// PUT : enregistre le fournisseur et le modèle actifs.
export async function PUT(request: NextRequest) {
  try {
    requireAdmin(request)

    const settings = normalizeAiSettings(await readJsonBody(request))
    for (const id of [settings.textProvider, settings.imageProvider]) {
      const provider = getProvider(id)
      if (provider && !isProviderConfigured(provider)) {
        throw new ApiError(400, 'bad_request', `${provider.label} n'est pas configuré : définissez ${provider.envVar} sur le serveur avant de l'activer.`)
      }
    }

    return NextResponse.json({ settings: await saveAiSettings(settings) })
  } catch (error) {
    return handleRouteError(error, 'admin/settings', "Impossible d'enregistrer les réglages.")
  }
}
