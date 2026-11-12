// ─── Catalogue des fournisseurs IA ───────────────────────────────────────────
// Ajouter un fournisseur compatible OpenAI = ajouter une entrée ici.
// Les clés API ne vivent QUE dans les variables d'environnement du serveur :
// le panneau d'administration choisit le fournisseur et le modèle, jamais la clé.

export type ProviderKind = 'text' | 'image'

export type ProviderId = 'pollinations' | 'openrouter' | 'together' | 'openai' | 'anthropic' | 'ollama'

export interface ProviderDefinition {
  id: ProviderId
  label: string
  description: string
  // Variable d'environnement requise (clé API ou URL). null = aucune configuration nécessaire.
  envVar: string | null
  // Protocole utilisé pour le texte
  textApi: 'pollinations' | 'openai-compatible' | 'anthropic' | null
  // Protocole utilisé pour les images
  imageApi: 'pollinations' | 'openai-images' | null
  // URL de base de l'API (compatible OpenAI). Pour Ollama, lue dans la variable d'environnement.
  baseUrl?: string
  defaultTextModel?: string
  defaultImageModel?: string
}

export const PROVIDERS: ProviderDefinition[] = [
  {
    id: 'pollinations',
    label: 'Pollinations (gratuit)',
    description: 'Modèles open source gratuits, sans clé. Débit limité.',
    envVar: null,
    textApi: 'pollinations',
    imageApi: 'pollinations',
    defaultTextModel: 'openai-fast',
    defaultImageModel: '',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description: 'Passerelle vers des centaines de modèles (dont certains gratuits).',
    envVar: 'OPENROUTER_API_KEY',
    textApi: 'openai-compatible',
    imageApi: null,
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultTextModel: 'meta-llama/llama-3.3-70b-instruct',
  },
  {
    id: 'together',
    label: 'Together AI',
    description: 'Modèles open source hébergés (texte et image).',
    envVar: 'TOGETHER_API_KEY',
    textApi: 'openai-compatible',
    imageApi: 'openai-images',
    baseUrl: 'https://api.together.xyz/v1',
    defaultTextModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    defaultImageModel: 'black-forest-labs/FLUX.1-schnell',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'Modèles GPT (texte) et génération d\'images.',
    envVar: 'OPENAI_API_KEY',
    textApi: 'openai-compatible',
    imageApi: 'openai-images',
    baseUrl: 'https://api.openai.com/v1',
    defaultTextModel: 'gpt-4o-mini',
    defaultImageModel: 'gpt-image-1',
  },
  {
    id: 'anthropic',
    label: 'Claude (Anthropic)',
    description: 'Modèles Claude pour le texte.',
    envVar: 'ANTHROPIC_API_KEY',
    textApi: 'anthropic',
    imageApi: null,
    defaultTextModel: 'claude-haiku-4-5-20251001',
  },
  {
    id: 'ollama',
    label: 'Ollama',
    description: 'Modèles locaux ou auto-hébergés. Le serveur doit pouvoir joindre l\'URL.',
    envVar: 'OLLAMA_BASE_URL',
    textApi: 'openai-compatible',
    imageApi: null,
    defaultTextModel: 'llama3.2',
  },
]

export function getProvider(id: string): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id)
}

export function supports(provider: ProviderDefinition, kind: ProviderKind): boolean {
  return kind === 'text' ? provider.textApi !== null : provider.imageApi !== null
}

// Un fournisseur est utilisable si sa variable d'environnement est définie.
export function isProviderConfigured(provider: ProviderDefinition): boolean {
  return provider.envVar === null || Boolean(process.env[provider.envVar])
}

export function defaultModel(provider: ProviderDefinition, kind: ProviderKind): string {
  return (kind === 'text' ? provider.defaultTextModel : provider.defaultImageModel) ?? ''
}

// Vue sans secret, destinée au panneau d'administration.
export interface ProviderSummary {
  id: ProviderId
  label: string
  description: string
  envVar: string | null
  configured: boolean
  supportsText: boolean
  supportsImage: boolean
  defaultTextModel: string
  defaultImageModel: string
}

export function listProviderSummaries(): ProviderSummary[] {
  return PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    envVar: p.envVar,
    configured: isProviderConfigured(p),
    supportsText: supports(p, 'text'),
    supportsImage: supports(p, 'image'),
    defaultTextModel: p.defaultTextModel ?? '',
    defaultImageModel: p.defaultImageModel ?? '',
  }))
}
