// ─── Pollinations.ai — génération de texte gratuite, sans clé API ────────────
// Endpoint compatible OpenAI : POST https://text.pollinations.ai/openai
// Modèle anonyme : `openai-fast` = GPT-OSS 20B (poids ouverts, licence Apache 2.0).
//
// Limite du palier anonyme : une requête texte à la fois par adresse IP, espacées
// d'environ 30 s. Au-delà, l'API répond 402/429 avec un en-tête Retry-After :
// on attend puis on réessaie.

import { ApiError } from './api-server'

const POLLINATIONS_TEXT_URL = 'https://text.pollinations.ai/openai'
const DEFAULT_TEXT_MODEL = 'openai-fast'

// `openai-fast` est un modèle à raisonnement : sans réglage, il produit ~1000
// jetons de réflexion pour une citation (≈ 18 s mesurées). En effort « low »,
// la même demande répond en ≈ 4 s pour une qualité comparable.
const DEFAULT_REASONING_EFFORT = 'low'

const MAX_ATTEMPTS = 3
const MAX_WAIT_MS = 32_000
const REQUEST_TIMEOUT_MS = 45_000

function retryDelayMs(res: Response, attempt: number): number {
  const retryAfter = Number(res.headers.get('retry-after'))
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000 + 500, MAX_WAIT_MS)
  }
  return attempt * 2000
}

export async function generateTextWithPollinations(
  systemPrompt: string,
  userPrompt: string,
  modelOverride?: string
): Promise<string> {
  let lastError: Error | null = null
  // 'off' désactive l'envoi du paramètre (POLLINATIONS_REASONING_EFFORT)
  let reasoningEffort: string | null = process.env.POLLINATIONS_REASONING_EFFORT || DEFAULT_REASONING_EFFORT
  if (reasoningEffort === 'off') reasoningEffort = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const startedAt = Date.now()
    let waitMs = attempt * 2000

    try {
      const res = await fetch(POLLINATIONS_TEXT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
        body: JSON.stringify({
          model: modelOverride || process.env.POLLINATIONS_TEXT_MODEL || DEFAULT_TEXT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 1.0,
          seed: Math.floor(Math.random() * 1_000_000),
          ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data?.choices?.[0]?.message?.content
        if (typeof text === 'string' && text.trim().length > 0) {
          return text
        }
        lastError = new Error('Empty response from Pollinations text API')
      } else if (res.status === 400 && reasoningEffort) {
        // Le service ne reconnaît plus ce paramètre : on réessaie sans lui
        console.warn('[pollinations-text] 400 with reasoning_effort, retrying without it')
        reasoningEffort = null
        lastError = new Error('Pollinations text API returned 400')
        waitMs = 500
      } else if (res.status === 402 || res.status === 429 || res.status >= 500) {
        // Limite de débit ou erreur passagère : retryable
        lastError = new Error(`Pollinations text API returned ${res.status}`)
        waitMs = retryDelayMs(res, attempt)
      } else {
        throw new Error(`Pollinations text API returned ${res.status}`)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('Text generation timed out')
      } else if (error instanceof Error && /returned 4\d\d$/.test(error.message) && !/returned (402|429)$/.test(error.message)) {
        throw error
      } else {
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    } finally {
      clearTimeout(timeout)
    }

    // Trace par tentative : permet de distinguer lenteur, quota et panne dans les logs
    console.warn(
      `[pollinations-text] attempt ${attempt}/${MAX_ATTEMPTS} failed after ${Date.now() - startedAt} ms: ${lastError?.message}`
    )

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, waitMs))
    }
  }

  console.error('[pollinations-text] all attempts failed:', lastError?.message)
  if (lastError && /returned (402|429)$/.test(lastError.message)) {
    throw new ApiError(429, 'rate_limited', 'Le service gratuit est très sollicité. Patientez 30 secondes puis réessayez.')
  }
  throw new ApiError(
    502,
    'upstream_error',
    'Le service de génération de texte est momentanément indisponible. Réessayez dans quelques secondes.'
  )
}
