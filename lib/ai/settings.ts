import { isDatabaseConfigured, query } from '../db'
import { ApiError } from '../api-server'
import { getProvider, supports, type ProviderId } from './providers'

// ─── Réglages IA (fournisseur et modèle actifs) ──────────────────────────────
// Stockés dans PostgreSQL (table app_settings). Sans base de données, ou si
// elle est injoignable, l'application utilise les réglages par défaut
// (Pollinations) : la génération ne dépend jamais de la base.

export interface AiSettings {
  textProvider: ProviderId
  textModel: string
  imageProvider: ProviderId
  imageModel: string
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  textProvider: 'pollinations',
  textModel: '',
  imageProvider: 'pollinations',
  imageModel: '',
}

const SETTINGS_KEY = 'ai'
const CACHE_TTL_MS = 30_000
const MAX_MODEL_LENGTH = 120

let cache: { value: AiSettings; expiresAt: number } | null = null
let tableReady = false

async function ensureTable(): Promise<void> {
  if (tableReady) return
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
  tableReady = true
}

// Valide et normalise des réglages venant de la base ou du panneau d'administration.
export function normalizeAiSettings(input: unknown): AiSettings {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>

  const pick = (value: unknown, kind: 'text' | 'image'): ProviderId => {
    const provider = typeof value === 'string' ? getProvider(value) : undefined
    return provider && supports(provider, kind) ? provider.id : 'pollinations'
  }
  const model = (value: unknown): string =>
    typeof value === 'string' ? value.trim().slice(0, MAX_MODEL_LENGTH) : ''

  return {
    textProvider: pick(raw.textProvider, 'text'),
    textModel: model(raw.textModel),
    imageProvider: pick(raw.imageProvider, 'image'),
    imageModel: model(raw.imageModel),
  }
}

export async function getAiSettings(): Promise<AiSettings> {
  if (cache && cache.expiresAt > Date.now()) return cache.value
  if (!isDatabaseConfigured()) return DEFAULT_AI_SETTINGS

  try {
    await ensureTable()
    const rows = await query<{ value: unknown }>('SELECT value FROM app_settings WHERE key = $1', [SETTINGS_KEY])
    const value = rows[0] ? normalizeAiSettings(rows[0].value) : DEFAULT_AI_SETTINGS
    cache = { value, expiresAt: Date.now() + CACHE_TTL_MS }
    return value
  } catch (error) {
    console.error('[ai-settings] read failed, using defaults:', error instanceof Error ? error.message : error)
    return cache?.value ?? DEFAULT_AI_SETTINGS
  }
}

export async function saveAiSettings(input: unknown): Promise<AiSettings> {
  if (!isDatabaseConfigured()) {
    throw new ApiError(503, 'not_configured', "La base de données n'est pas configurée : impossible d'enregistrer les réglages.")
  }

  const value = normalizeAiSettings(input)
  try {
    await ensureTable()
    await query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [SETTINGS_KEY, JSON.stringify(value)]
    )
  } catch (error) {
    console.error('[ai-settings] save failed:', error instanceof Error ? error.message : error)
    throw new ApiError(503, 'upstream_error', "La base de données est injoignable : réglages non enregistrés.")
  }

  cache = { value, expiresAt: Date.now() + CACHE_TTL_MS }
  return value
}
