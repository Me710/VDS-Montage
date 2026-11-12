import { ApiError, fetchWithTimeout } from '../api-server'
import { generateTextWithPollinations } from '../pollinations-text'
import { defaultModel, getProvider, isProviderConfigured, type ProviderDefinition } from './providers'
import { getAiSettings, type AiSettings } from './settings'

// ─── Génération de texte, tous fournisseurs ──────────────────────────────────

const REQUEST_TIMEOUT_MS = 45_000
const MAX_TOKENS = 1_024

function providerError(provider: ProviderDefinition, status: number): ApiError {
  if (status === 401 || status === 403) {
    return new ApiError(502, 'upstream_error', `${provider.label} a refusé la clé API. Vérifiez ${provider.envVar}.`)
  }
  if (status === 404) {
    return new ApiError(502, 'upstream_error', `${provider.label} ne connaît pas ce modèle. Vérifiez son nom dans l'administration.`)
  }
  if (status === 402 || status === 429) {
    return new ApiError(429, 'rate_limited', `${provider.label} : quota ou crédit épuisé. Réessayez plus tard.`)
  }
  return new ApiError(502, 'upstream_error', `${provider.label} est momentanément indisponible (code ${status}).`)
}

function baseUrlFor(provider: ProviderDefinition): string {
  if (provider.id === 'ollama') {
    const url = (process.env.OLLAMA_BASE_URL || '').replace(/\/+$/, '')
    return url.endsWith('/v1') ? url : `${url}/v1`
  }
  return provider.baseUrl ?? ''
}

async function callOpenAiCompatible(
  provider: ProviderDefinition,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  // Ollama n'exige pas de clé ; les autres la lisent dans leur variable d'environnement
  if (provider.id !== 'ollama' && provider.envVar) {
    headers.Authorization = `Bearer ${process.env[provider.envVar]}`
  }

  const res = await fetchWithTimeout(
    `${baseUrlFor(provider)}/chat/completions`,
    {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1.0,
        max_tokens: MAX_TOKENS,
      }),
    },
    REQUEST_TIMEOUT_MS
  )

  if (!res.ok) throw providerError(provider, res.status)
  const data = await res.json().catch(() => null)
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw new ApiError(502, 'upstream_error', `${provider.label} a renvoyé une réponse vide.`)
  }
  return text
}

async function callAnthropic(
  provider: ProviderDefinition,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const res = await fetchWithTimeout(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      cache: 'no-store',
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        temperature: 1.0,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    },
    REQUEST_TIMEOUT_MS
  )

  if (!res.ok) throw providerError(provider, res.status)
  const data = await res.json().catch(() => null)
  const block = Array.isArray(data?.content) ? data.content.find((b: { type?: string }) => b?.type === 'text') : null
  if (typeof block?.text !== 'string' || !block.text.trim()) {
    throw new ApiError(502, 'upstream_error', `${provider.label} a renvoyé une réponse vide.`)
  }
  return block.text
}

// Appelle UN fournisseur précis, sans repli. Utilisé par le test de l'administration.
export async function generateTextWith(
  settings: Pick<AiSettings, 'textProvider' | 'textModel'>,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const provider = getProvider(settings.textProvider)
  if (!provider || provider.textApi === null) {
    throw new ApiError(400, 'bad_request', 'Fournisseur de texte inconnu.')
  }
  if (!isProviderConfigured(provider)) {
    throw new ApiError(503, 'not_configured', `${provider.label} n'est pas configuré : définissez ${provider.envVar} sur le serveur.`)
  }

  const model = settings.textModel || defaultModel(provider, 'text')

  try {
    switch (provider.textApi) {
      case 'pollinations':
        return await generateTextWithPollinations(systemPrompt, userPrompt, settings.textModel || undefined)
      case 'anthropic':
        return await callAnthropic(provider, model, systemPrompt, userPrompt)
      default:
        return await callOpenAiCompatible(provider, model, systemPrompt, userPrompt)
    }
  } catch (error) {
    if (error instanceof ApiError) throw error
    const timedOut = error instanceof Error && error.name === 'AbortError'
    throw new ApiError(
      502,
      'upstream_error',
      timedOut ? `${provider.label} met trop de temps à répondre.` : `${provider.label} est injoignable.`
    )
  }
}

// Point d'entrée de l'application : fournisseur choisi dans l'administration,
// avec repli automatique sur Pollinations (gratuit) si ce fournisseur échoue.
export async function generateText(systemPrompt: string, userPrompt: string): Promise<string> {
  const settings = await getAiSettings()

  if (settings.textProvider !== 'pollinations') {
    try {
      return await generateTextWith(settings, systemPrompt, userPrompt)
    } catch (error) {
      console.warn(
        `[ai-text] ${settings.textProvider} failed, falling back to pollinations:`,
        error instanceof Error ? error.message : error
      )
      return generateTextWithPollinations(systemPrompt, userPrompt)
    }
  }

  return generateTextWith(settings, systemPrompt, userPrompt)
}
