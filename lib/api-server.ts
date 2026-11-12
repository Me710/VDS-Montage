import { NextRequest, NextResponse } from 'next/server'

// ─── Outils communs aux routes API ───────────────────────────────────────────
// Toutes les erreurs renvoient la même forme : { error: string, code: string }
// avec un message en français, affichable tel quel à l'utilisateur.

export type ApiErrorCode =
  | 'bad_request'
  | 'rate_limited'
  | 'not_configured'
  | 'upstream_error'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'internal_error'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function jsonError(status: number, code: ApiErrorCode, message: string, headers?: HeadersInit) {
  return NextResponse.json({ error: message, code }, { status, headers })
}

// Lit un corps JSON objet ; lève une ApiError 400 si le corps est absent ou invalide.
export async function readJsonBody(request: NextRequest): Promise<Record<string, unknown>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    throw new ApiError(400, 'bad_request', 'Requête invalide.')
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'bad_request', 'Requête invalide.')
  }
  return body as Record<string, unknown>
}

// fetch avec délai maximal : évite qu'un service externe lent bloque la route.
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15_000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

// ─── Limitation de débit en mémoire (par adresse IP et par route) ────────────
// Suffisant pour une instance unique : protège le quota gratuit partagé contre
// les rafales. Remis à zéro à chaque redémarrage.

const buckets = new Map<string, { count: number; resetAt: number }>()

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

export function enforceRateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs = 60_000
): void {
  const now = Date.now()
  const key = `${scope}:${clientIp(request)}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    // Purge opportuniste pour borner la mémoire
    if (buckets.size > 5_000) {
      buckets.forEach((value, k) => {
        if (value.resetAt <= now) buckets.delete(k)
      })
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > limit) {
    throw new ApiError(429, 'rate_limited', 'Trop de demandes. Patientez une minute avant de réessayer.')
  }
}

// Convertit n'importe quelle erreur en réponse JSON propre, et journalise les
// détails techniques côté serveur uniquement.
export function handleRouteError(error: unknown, context: string, fallbackMessage: string) {
  if (error instanceof ApiError) {
    if (error.status >= 500) console.error(`[${context}]`, error.message)
    return jsonError(error.status, error.code, error.message)
  }
  console.error(`[${context}]`, error)
  return jsonError(500, 'internal_error', fallbackMessage)
}
