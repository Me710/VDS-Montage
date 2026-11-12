// ─── Appels API côté navigateur ──────────────────────────────────────────────
// Un seul point d'entrée : délai maximal, lecture JSON tolérante, et messages
// d'erreur en français quel que soit le type de panne (réseau, délai, serveur).

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  timeoutMs?: number
  fallbackMessage?: string
}

export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    timeoutMs = 90_000,
    fallbackMessage = 'Une erreur est survenue. Merci de réessayer.',
  } = options

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiClientError('Vous êtes hors ligne. Vérifiez votre connexion.', 0, 'offline')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiClientError('Le serveur met trop de temps à répondre. Merci de réessayer.', 0, 'timeout')
    }
    throw new ApiClientError('Connexion impossible. Vérifiez votre réseau puis réessayez.', 0, 'network')
  } finally {
    clearTimeout(timer)
  }

  // La réponse peut ne pas être du JSON (page d'erreur d'un proxy, par exemple)
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const payload = (data && typeof data === 'object' ? data : {}) as { error?: unknown; code?: unknown }
    const message = typeof payload.error === 'string' && payload.error ? payload.error : fallbackMessage
    throw new ApiClientError(message, response.status, typeof payload.code === 'string' ? payload.code : undefined)
  }

  if (data === null) {
    throw new ApiClientError(fallbackMessage, response.status, 'invalid_response')
  }

  return data as T
}

export function errorMessage(error: unknown, fallback = 'Une erreur est survenue. Merci de réessayer.'): string {
  return error instanceof ApiClientError ? error.message : fallback
}
