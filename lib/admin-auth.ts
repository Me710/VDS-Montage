import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import { ApiError } from './api-server'

// ─── Authentification de l'administration ────────────────────────────────────
// Un seul compte : le mot de passe est la variable d'environnement ADMIN_PASSWORD.
// La session est un cookie httpOnly signé (HMAC-SHA256) contenant sa date
// d'expiration ; rien n'est stocké côté serveur.

export const ADMIN_COOKIE = 'vds_admin'
export const SESSION_TTL_SECONDS = 8 * 60 * 60 // 8 heures

const MIN_PASSWORD_LENGTH = 10

export function isAdminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD ?? '').length >= MIN_PASSWORD_LENGTH
}

function signingKey(): string {
  // Changer le mot de passe invalide toutes les sessions existantes
  return createHmac('sha256', 'vds-admin-session').update(process.env.ADMIN_PASSWORD ?? '').digest('hex')
}

function sign(payload: string): string {
  return createHmac('sha256', signingKey()).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  // Comparaison à temps constant, sur des empreintes de longueur fixe
  const ha = createHmac('sha256', 'cmp').update(a).digest()
  const hb = createHmac('sha256', 'cmp').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export function verifyAdminPassword(candidate: string): boolean {
  if (!isAdminConfigured()) return false
  return safeEqual(candidate, process.env.ADMIN_PASSWORD ?? '')
}

export function createSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = String(expiresAt)
  return `${payload}.${sign(payload)}`
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token || !isAdminConfigured()) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !/^\d+$/.test(payload)) return false
  if (!safeEqual(signature, sign(payload))) return false
  return Number(payload) > Math.floor(Date.now() / 1000)
}

export function isAdminRequest(request: NextRequest): boolean {
  return isValidSessionToken(request.cookies.get(ADMIN_COOKIE)?.value)
}

// À appeler en tête de chaque route d'administration.
export function requireAdmin(request: NextRequest): void {
  if (!isAdminConfigured()) {
    throw new ApiError(503, 'not_configured', "L'administration n'est pas activée : définissez ADMIN_PASSWORD (10 caractères minimum) sur le serveur.")
  }
  if (!isAdminRequest(request)) {
    throw new ApiError(401, 'unauthorized', 'Session expirée. Reconnectez-vous.')
  }
  // Protection CSRF : les requêtes qui modifient l'état doivent venir du même site
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
    if (origin && host && new URL(origin).host !== host) {
      throw new ApiError(403, 'forbidden', 'Requête refusée.')
    }
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}
