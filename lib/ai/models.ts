import { ApiError, fetchWithTimeout } from '../api-server'
import { getProvider, isProviderConfigured, supports, type ProviderDefinition, type ProviderKind } from './providers'

// ─── Liste dynamique des modèles disponibles chez chaque fournisseur ─────────
// Interroge l'API « models » du fournisseur avec la clé du serveur, puis garde
// le résultat 10 minutes en mémoire. Les formats de réponse diffèrent d'un
// fournisseur à l'autre : chaque lecture est tolérante (champs optionnels).

export interface ModelInfo {
  id: string
  label: string
  free?: boolean
}

const CACHE_TTL_MS = 10 * 60_000
const REQUEST_TIMEOUT_MS = 12_000
const MAX_MODELS = 600

const cache = new Map<string, { models: ModelInfo[]; expiresAt: number }>()

type Json = Record<string, unknown>

function asArray(value: unknown): Json[] {
  if (Array.isArray(value)) return value.filter((v): v is Json => Boolean(v) && typeof v === 'object')
  const data = (value as Json | null)?.data ?? (value as Json | null)?.models
  return Array.isArray(data) ? data.filter((v): v is Json => Boolean(v) && typeof v === 'object') : []
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '')
const list = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [])

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetchWithTimeout(url, { headers, cache: 'no-store' }, REQUEST_TIMEOUT_MS)
  if (!res.ok) {
    throw new Error(`models endpoint returned ${res.status}`)
  }
  return res.json()
}

function bearer(provider: ProviderDefinition): Record<string, string> {
  return provider.envVar ? { Authorization: `Bearer ${process.env[provider.envVar]}` } : {}
}

async function openRouterModels(): Promise<ModelInfo[]> {
  // Catalogue public : aucune clé nécessaire pour le lire
  const items = asArray(await getJson('https://openrouter.ai/api/v1/models'))
  return items
    .filter((m) => list((m.architecture as Json | undefined)?.output_modalities).includes('text'))
    .map((m) => {
      const pricing = (m.pricing ?? {}) as Json
      return {
        id: str(m.id),
        label: str(m.name) || str(m.id),
        free: pricing.prompt === '0' && pricing.completion === '0',
      }
    })
}

async function togetherModels(provider: ProviderDefinition, kind: ProviderKind): Promise<ModelInfo[]> {
  const items = asArray(await getJson('https://api.together.xyz/v1/models', bearer(provider)))
  const wanted = kind === 'text' ? ['chat', 'language'] : ['image']
  return items
    .filter((m) => wanted.includes(str(m.type)))
    .map((m) => ({ id: str(m.id), label: str(m.display_name) || str(m.id) }))
}

async function openAiModels(provider: ProviderDefinition, kind: ProviderKind): Promise<ModelInfo[]> {
  const items = asArray(await getJson('https://api.openai.com/v1/models', bearer(provider)))
  // L'API ne précise pas le type de chaque modèle : tri par convention de nommage
  const isImage = (id: string) => /^(gpt-image|dall-e)/.test(id)
  const isText = (id: string) =>
    /^(gpt-|o\d|chatgpt-)/.test(id) &&
    !/(image|audio|realtime|tts|transcribe|embedding|search|instruct|moderation)/.test(id)
  return items
    .map((m) => str(m.id))
    .filter((id) => (kind === 'image' ? isImage(id) : isText(id)))
    .map((id) => ({ id, label: id }))
}

async function anthropicModels(): Promise<ModelInfo[]> {
  const items = asArray(
    await getJson('https://api.anthropic.com/v1/models?limit=100', {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    })
  )
  return items.map((m) => ({ id: str(m.id), label: str(m.display_name) || str(m.id) }))
}

async function ollamaModels(): Promise<ModelInfo[]> {
  const base = (process.env.OLLAMA_BASE_URL || '').replace(/\/+$/, '').replace(/\/v1$/, '')
  // /api/tags liste les modèles installés sur le serveur Ollama
  const items = asArray(await getJson(`${base}/api/tags`))
  return items.map((m) => {
    const id = str(m.name) || str(m.model) || str(m.id)
    return { id, label: id }
  })
}

async function pollinationsModels(kind: ProviderKind): Promise<ModelInfo[]> {
  // Avec une clé de compte : catalogue complet. Sans clé : palier anonyme
  // (un seul modèle de texte, pas de choix de modèle d'image).
  if (process.env.POLLINATIONS_API_KEY) {
    const items = asArray(await getJson('https://gen.pollinations.ai/v1/models'))
    return items
      .filter((m) => {
        const outputs = list(m.output_modalities)
        return kind === 'text' ? str(m.category) === 'text' && outputs.includes('text') : outputs.includes('image')
      })
      .map((m) => ({
        id: str(m.id),
        label: str(m.title) || str(m.id),
        free: m.paid_only === false,
      }))
  }

  if (kind === 'image') return []
  const items = asArray(await getJson('https://text.pollinations.ai/models'))
  return items.map((m) => ({
    id: str(m.name),
    label: str(m.description) || str(m.name),
    free: true,
  }))
}

export async function listModels(providerId: string, kind: ProviderKind): Promise<ModelInfo[]> {
  const provider = getProvider(providerId)
  if (!provider || !supports(provider, kind)) {
    throw new ApiError(400, 'bad_request', 'Fournisseur inconnu.')
  }
  if (!isProviderConfigured(provider)) {
    throw new ApiError(503, 'not_configured', `${provider.label} n'est pas configuré : définissez ${provider.envVar} sur le serveur.`)
  }

  const cacheKey = `${provider.id}:${kind}:${provider.id === 'pollinations' && process.env.POLLINATIONS_API_KEY ? 'keyed' : 'default'}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.models

  let models: ModelInfo[]
  try {
    switch (provider.id) {
      case 'openrouter': models = await openRouterModels(); break
      case 'together': models = await togetherModels(provider, kind); break
      case 'openai': models = await openAiModels(provider, kind); break
      case 'anthropic': models = await anthropicModels(); break
      case 'ollama': models = await ollamaModels(); break
      default: models = await pollinationsModels(kind)
    }
  } catch (error) {
    console.warn(`[ai-models] ${provider.id} listing failed:`, error instanceof Error ? error.message : error)
    const refused = error instanceof Error && /returned (401|403)$/.test(error.message)
    throw new ApiError(
      502,
      'upstream_error',
      refused
        ? `${provider.label} a refusé la clé API. Vérifiez ${provider.envVar}.`
        : `Impossible de récupérer la liste des modèles de ${provider.label}. Saisissez le modèle manuellement.`
    )
  }

  // Dédoublonne, retire les entrées vides, trie (gratuits d'abord, puis alphabétique)
  const seen = new Set<string>()
  models = models
    .filter((m) => m.id && !seen.has(m.id) && Boolean(seen.add(m.id)))
    .sort((a, b) => Number(Boolean(b.free)) - Number(Boolean(a.free)) || a.id.localeCompare(b.id))
    .slice(0, MAX_MODELS)

  cache.set(cacheKey, { models, expiresAt: Date.now() + CACHE_TTL_MS })
  return models
}
