import { NextRequest, NextResponse } from 'next/server'
import { ApiError, enforceRateLimit, handleRouteError, readJsonBody } from '@/lib/api-server'
import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminConfigured,
  sessionCookieOptions,
  verifyAdminPassword,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Frein aux essais de mot de passe : 5 tentatives par minute et par adresse IP
    enforceRateLimit(request, 'admin-login', 5)

    if (!isAdminConfigured()) {
      throw new ApiError(503, 'not_configured', "L'administration n'est pas activée : définissez ADMIN_PASSWORD (10 caractères minimum) sur le serveur.")
    }

    const body = await readJsonBody(request)
    if (typeof body.password !== 'string' || !verifyAdminPassword(body.password)) {
      throw new ApiError(401, 'unauthorized', 'Mot de passe incorrect.')
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions())
    return response
  } catch (error) {
    return handleRouteError(error, 'admin/login', 'Connexion impossible. Merci de réessayer.')
  }
}
