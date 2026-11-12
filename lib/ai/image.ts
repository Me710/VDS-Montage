import { ApiError, fetchWithTimeout } from '../api-server'
import { generatePollinationsImage } from '../pollinations'
import { defaultModel, getProvider, isProviderConfigured, type ProviderDefinition } from './providers'
import { getAiSettings, type AiSettings } from './settings'

// ─── Génération d'image, tous fournisseurs ───────────────────────────────────
// Chaque fonction renvoie une data-URL base64 : le navigateur n'a jamais à
// charger une image depuis un domaine tiers (pas de souci CORS pour l'export).

const REQUEST_TIMEOUT_MS = 90_000

function providerError(provider: ProviderDefinition, status: number): ApiError {
  if (status === 401 || status === 403) {
    return new ApiError(502, 'upstream_error', `${provider.label} a refusé la clé API. Vérifiez ${provider.envVar}.`)
  }
  if (status === 404) {
    return new ApiError(502, 'upstream_error', `${provider.label} ne connaît pas ce modèle d'image. Vérifiez son nom dans l'administration.`)
  }
  if (status === 402 || status === 429) {
    return new ApiError(429, 'rate_limited', `${provider.label} : quota ou crédit épuisé. Réessayez plus tard.`)
  }
  return new ApiError(502, 'upstream_error', `${provider.label} est momentanément indisponible (code ${status}).`)
}

// API « images/generations » au format OpenAI (OpenAI, Together AI).
async function callOpenAiImages(provider: ProviderDefinition, model: string, prompt: string): Promise<string> {
  const body: Record<string, unknown> = { model, prompt, n: 1 }
  if (provider.id === 'together') {
    body.width = 768
    body.height = 768
    body.response_format = 'b64_json'
  } else {
    body.size = '1024x1024'
  }

  const res = await fetchWithTimeout(
    `${provider.baseUrl}/images/generations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.envVar ? process.env[provider.envVar] : ''}`,
      },
      cache: 'no-store',
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT_MS
  )

  if (!res.ok) throw providerError(provider, res.status)
  const data = await res.json().catch(() => null)
  const item = data?.data?.[0]

  if (typeof item?.b64_json === 'string' && item.b64_json) {
    return `data:image/png;base64,${item.b64_json}`
  }

  // Certains modèles renvoient une URL temporaire : on la télécharge côté serveur
  if (typeof item?.url === 'string' && /^https:\/\//.test(item.url)) {
    const imageRes = await fetchWithTimeout(item.url, { cache: 'no-store' }, 30_000)
    if (imageRes.ok) {
      const mimeType = imageRes.headers.get('content-type') || 'image/png'
      const buffer = Buffer.from(await imageRes.arrayBuffer())
      return `data:${mimeType};base64,${buffer.toString('base64')}`
    }
  }

  throw new ApiError(502, 'upstream_error', `${provider.label} a renvoyé une image vide.`)
}

// Appelle UN fournisseur précis, sans repli.
export async function generateImageWith(
  settings: Pick<AiSettings, 'imageProvider' | 'imageModel'>,
  prompt: string
): Promise<string> {
  const provider = getProvider(settings.imageProvider)
  if (!provider || provider.imageApi === null) {
    throw new ApiError(400, 'bad_request', "Fournisseur d'image inconnu.")
  }
  if (!isProviderConfigured(provider)) {
    throw new ApiError(503, 'not_configured', `${provider.label} n'est pas configuré : définissez ${provider.envVar} sur le serveur.`)
  }

  try {
    if (provider.imageApi === 'pollinations') {
      return await generatePollinationsImage(prompt)
    }
    return await callOpenAiImages(provider, settings.imageModel || defaultModel(provider, 'image'), prompt)
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

// Point d'entrée de l'application, avec repli sur Pollinations si le fournisseur choisi échoue.
export async function generateImage(prompt: string): Promise<string> {
  const settings = await getAiSettings()

  if (settings.imageProvider !== 'pollinations') {
    try {
      return await generateImageWith(settings, prompt)
    } catch (error) {
      console.warn(
        `[ai-image] ${settings.imageProvider} failed, falling back to pollinations:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  return generatePollinationsImage(prompt)
}
