'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, FlaskConical, Image as ImageIcon, Loader2, LogOut, MessageSquare, Save, ShieldCheck } from 'lucide-react'
import { apiFetch, errorMessage } from '@/lib/api-client'
import { toast } from '@/lib/toast-store'
import { cn } from '@/lib/utils'

interface ProviderSummary {
  id: string
  label: string
  description: string
  envVar: string | null
  configured: boolean
  supportsText: boolean
  supportsImage: boolean
  defaultTextModel: string
  defaultImageModel: string
}

interface AiSettings {
  textProvider: string
  textModel: string
  imageProvider: string
  imageModel: string
}

interface AdminState {
  adminConfigured: boolean
  authenticated: boolean
  databaseConfigured?: boolean
  settings?: AiSettings
  providers?: ProviderSummary[]
}

type Kind = 'text' | 'image'

interface ModelInfo {
  id: string
  label: string
  free?: boolean
}

interface ModelListState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  models: ModelInfo[]
  error?: string
}

interface TestResult {
  ok: boolean
  message: string
  imageUrl?: string
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh p-4 md:p-8 pb-28 md:pb-28">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" aria-hidden />
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Administration</h1>
              <p className="text-xs text-white/50">VDS Montage — fournisseurs et modèles IA</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Retour à l&apos;éditeur
          </Link>
        </header>
        {children}
      </div>
    </main>
  )
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !password) return
    setSubmitting(true)
    setError(null)
    try {
      await apiFetch('/api/admin/login', { method: 'POST', body: { password }, timeoutMs: 15_000, fallbackMessage: 'Connexion impossible.' })
      setPassword('')
      onSuccess()
    } catch (err) {
      setError(errorMessage(err, 'Connexion impossible.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="section-card p-6 space-y-4 max-w-sm mx-auto">
      <div className="space-y-1">
        <label htmlFor="admin-password" className="text-xs font-medium text-white/70">Mot de passe administrateur</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field text-sm py-2 w-full"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-300 bg-red-500/20 border border-red-500/30 rounded-lg p-2">{error}</p>
      )}
      <button type="submit" disabled={submitting || !password} className="btn-primary w-full py-2 text-sm">
        {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
        Se connecter
      </button>
    </form>
  )
}

function ProviderSection({
  kind,
  providers,
  providerId,
  model,
  onChange,
}: {
  kind: Kind
  providers: ProviderSummary[]
  providerId: string
  model: string
  onChange: (providerId: string, model: string) => void
}) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [modelList, setModelList] = useState<ModelListState>({ status: 'idle', models: [] })
  const [freeOnly, setFreeOnly] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  // Récupère la liste des modèles du fournisseur sélectionné (liste en direct,
  // mise en cache 10 minutes côté serveur). En cas d'échec, la saisie manuelle reste possible.
  useEffect(() => {
    let cancelled = false
    setModelList({ status: 'loading', models: [] })
    apiFetch<{ models: ModelInfo[] }>(
      `/api/admin/models?provider=${encodeURIComponent(providerId)}&kind=${kind}`,
      { timeoutMs: 20_000, fallbackMessage: 'Liste des modèles indisponible.' }
    )
      .then((data) => {
        if (!cancelled) setModelList({ status: 'ready', models: Array.isArray(data.models) ? data.models : [] })
      })
      .catch((err) => {
        if (!cancelled) setModelList({ status: 'error', models: [], error: errorMessage(err, 'Liste des modèles indisponible.') })
      })
    return () => {
      cancelled = true
    }
  }, [providerId, kind, reloadToken])

  const hasFreeFlag = modelList.models.some((m) => m.free)
  const hasPaid = modelList.models.some((m) => !m.free)
  const visibleModels = freeOnly ? modelList.models.filter((m) => m.free) : modelList.models
  const knownModel = model === '' || modelList.status !== 'ready' || modelList.models.length === 0 || modelList.models.some((m) => m.id === model)

  const available = providers.filter((p) => (kind === 'text' ? p.supportsText : p.supportsImage))
  const selected = available.find((p) => p.id === providerId)
  const defaultModel = selected ? (kind === 'text' ? selected.defaultTextModel : selected.defaultImageModel) : ''
  const title = kind === 'text' ? 'Génération de texte' : "Génération d'image"
  const Icon = kind === 'text' ? MessageSquare : ImageIcon

  const runTest = async () => {
    if (testing) return
    setTesting(true)
    setResult(null)
    try {
      const body = kind === 'text'
        ? { kind, textProvider: providerId, textModel: model }
        : { kind, imageProvider: providerId, imageModel: model }
      const data = await apiFetch<{ durationMs: number; text?: string; imageUrl?: string }>('/api/admin/test', {
        method: 'POST',
        body,
        timeoutMs: 150_000,
        fallbackMessage: 'Le test a échoué.',
      })
      const seconds = (data.durationMs / 1000).toFixed(1)
      setResult({
        ok: true,
        message: kind === 'text' ? `Réponse en ${seconds} s : ${data.text ?? ''}` : `Image générée en ${seconds} s.`,
        imageUrl: data.imageUrl,
      })
    } catch (err) {
      setResult({ ok: false, message: errorMessage(err, 'Le test a échoué.') })
    } finally {
      setTesting(false)
    }
  }

  return (
    <section className="section-card p-5 space-y-4" aria-labelledby={`section-${kind}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" aria-hidden />
        <h2 id={`section-${kind}`} className="text-sm font-semibold text-white">{title}</h2>
      </div>

      <div role="radiogroup" aria-label={`Fournisseur pour : ${title}`} className="grid sm:grid-cols-2 gap-2">
        {available.map((provider) => {
          const active = provider.id === providerId
          return (
            <button
              type="button"
              key={provider.id}
              role="radio"
              aria-checked={active}
              disabled={!provider.configured}
              onClick={() => {
                setResult(null)
                setFreeOnly(false)
                onChange(provider.id, '')
              }}
              className={cn(
                'text-left rounded-xl border p-3 transition-colors',
                active ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/30',
                !provider.configured && 'opacity-50 cursor-not-allowed hover:border-white/10'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white">{provider.label}</span>
                {provider.configured ? (
                  <span className="text-[10px] text-green-300 bg-green-500/15 border border-green-500/30 rounded-full px-2 py-0.5">Prêt</span>
                ) : (
                  <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full px-2 py-0.5">Clé manquante</span>
                )}
              </div>
              <p className="text-[11px] text-white/50 mt-1 leading-snug">{provider.description}</p>
              {!provider.configured && provider.envVar && (
                <p className="text-[11px] text-amber-200/80 mt-1">
                  Ajoutez <code className="font-mono">{provider.envVar}</code> dans les variables du serveur.
                </p>
              )}
            </button>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`model-${kind}`} className="text-xs font-medium text-white/70">Modèle</label>
          <div className="flex items-center gap-3">
            {hasFreeFlag && hasPaid && (
              <label className="flex items-center gap-1.5 text-[11px] text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                  className="accent-[#d4af37]"
                />
                Gratuits uniquement
              </label>
            )}
            <button
              type="button"
              onClick={() => setReloadToken((n) => n + 1)}
              disabled={modelList.status === 'loading'}
              aria-label="Actualiser la liste des modèles"
              title="Actualiser la liste des modèles"
              className="text-white/50 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', modelList.status === 'loading' && 'animate-spin')} aria-hidden />
            </button>
          </div>
        </div>

        <input
          id={`model-${kind}`}
          type="text"
          list={`models-${kind}`}
          value={model}
          onChange={(e) => {
            setResult(null)
            onChange(providerId, e.target.value)
          }}
          placeholder={defaultModel ? `Par défaut : ${defaultModel}` : 'Modèle par défaut du fournisseur'}
          maxLength={120}
          spellCheck={false}
          autoComplete="off"
          className="input-field text-sm py-2 w-full font-mono"
        />
        <datalist id={`models-${kind}`}>
          {visibleModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}{m.free && hasPaid ? ' — gratuit' : ''}
            </option>
          ))}
        </datalist>

        <p role="status" className="text-[11px] text-white/40 leading-snug">
          {modelList.status === 'loading' && 'Récupération des modèles disponibles...'}
          {modelList.status === 'ready' && modelList.models.length > 0 &&
            `${visibleModels.length} modèle${visibleModels.length > 1 ? 's' : ''} disponible${visibleModels.length > 1 ? 's' : ''} : cliquez dans le champ ou tapez pour filtrer. Laissez vide pour le modèle par défaut.`}
          {modelList.status === 'ready' && modelList.models.length === 0 &&
            'Ce fournisseur ne propose pas de choix de modèle ici. Laissez vide pour le modèle par défaut.'}
          {modelList.status === 'error' && modelList.error}
        </p>
        {!knownModel && (
          <p className="text-[11px] text-amber-200/80 leading-snug">
            Ce modèle n&apos;apparaît pas dans la liste du fournisseur. Testez-le avant d&apos;enregistrer.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <button type="button" onClick={runTest} disabled={testing} className="btn-secondary text-xs py-2 px-4">
          {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> : <FlaskConical className="w-3.5 h-3.5" aria-hidden />}
          {testing ? 'Test en cours...' : 'Tester ce réglage'}
        </button>
        {result && (
          <div
            role={result.ok ? 'status' : 'alert'}
            className={cn(
              'flex items-start gap-2 text-xs rounded-lg p-2 border',
              result.ok ? 'text-green-200 bg-green-500/10 border-green-500/30' : 'text-red-300 bg-red-500/20 border-red-500/30'
            )}
          >
            {result.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden /> : <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />}
            <div className="space-y-2 min-w-0">
              <p className="leading-snug break-words">{result.message}</p>
              {result.imageUrl && (
                <img src={result.imageUrl} alt="Image de test générée" className="w-40 h-40 object-cover rounded-lg border border-white/10" />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function AdminPanel() {
  const [state, setState] = useState<AdminState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [draft, setDraft] = useState<AiSettings | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      const data = await apiFetch<AdminState>('/api/admin/settings', { timeoutMs: 20_000, fallbackMessage: 'Impossible de charger les réglages.' })
      setState(data)
      setDraft(data.settings ?? null)
    } catch (err) {
      setLoadError(errorMessage(err, 'Impossible de charger les réglages.'))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      const data = await apiFetch<{ settings: AiSettings }>('/api/admin/settings', {
        method: 'PUT',
        body: draft,
        timeoutMs: 20_000,
        fallbackMessage: "Impossible d'enregistrer les réglages.",
      })
      setDraft(data.settings)
      setState((prev) => (prev ? { ...prev, settings: data.settings } : prev))
      toast.success('Réglages enregistrés. Ils s\'appliquent en moins d\'une minute.')
    } catch (err) {
      const message = errorMessage(err, "Impossible d'enregistrer les réglages.")
      toast.error(message)
      // Session expirée : on revient à l'écran de connexion
      if ((err as { status?: number })?.status === 401) load()
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/api/admin/logout', { method: 'POST', timeoutMs: 10_000 })
    } catch {
      // Même en cas d'échec réseau, on recharge l'état
    }
    load()
  }

  if (loadError) {
    return (
      <Shell>
        <div role="alert" className="section-card p-6 text-sm text-red-300 space-y-3">
          <p>{loadError}</p>
          <button type="button" onClick={load} className="btn-secondary text-xs py-2 px-4">Réessayer</button>
        </div>
      </Shell>
    )
  }

  if (!state) {
    return (
      <Shell>
        <div role="status" className="flex items-center justify-center gap-3 py-16 text-white/60 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          Chargement...
        </div>
      </Shell>
    )
  }

  if (!state.adminConfigured) {
    return (
      <Shell>
        <div className="section-card p-6 space-y-2 text-sm text-white/80">
          <p className="font-semibold text-white">L&apos;administration n&apos;est pas encore activée.</p>
          <p>
            Ajoutez la variable <code className="font-mono text-primary">ADMIN_PASSWORD</code> (10 caractères minimum) dans les
            variables du serveur, puis rechargez cette page.
          </p>
        </div>
      </Shell>
    )
  }

  if (!state.authenticated || !draft || !state.providers) {
    return (
      <Shell>
        <LoginForm onSuccess={load} />
      </Shell>
    )
  }

  const saved = state.settings
  const dirty = !saved || (Object.keys(draft) as (keyof AiSettings)[]).some((key) => draft[key] !== saved[key])

  return (
    <Shell>
      {!state.databaseConfigured && (
        <div role="alert" className="section-card p-4 text-xs text-amber-200 border-amber-500/30 bg-amber-500/10">
          La base de données n&apos;est pas configurée : les réglages ne peuvent pas être enregistrés et l&apos;application
          utilise Pollinations.
        </div>
      )}

      <ProviderSection
        kind="text"
        providers={state.providers}
        providerId={draft.textProvider}
        model={draft.textModel}
        onChange={(textProvider, textModel) => setDraft({ ...draft, textProvider, textModel })}
      />

      <ProviderSection
        kind="image"
        providers={state.providers}
        providerId={draft.imageProvider}
        model={draft.imageModel}
        onChange={(imageProvider, imageModel) => setDraft({ ...draft, imageProvider, imageModel })}
      />

      <p className="text-[11px] text-white/40 leading-snug">
        Si le fournisseur choisi échoue (clé refusée, quota, panne), l&apos;application bascule automatiquement sur Pollinations
        pour que la génération continue de fonctionner. Les clés API restent dans les variables du serveur et ne sont jamais
        affichées ici.
      </p>

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={logout} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
          <LogOut className="w-3.5 h-3.5" aria-hidden />
          Se déconnecter
        </button>
        <button type="button" onClick={save} disabled={saving || !dirty} className="btn-primary py-2 px-5 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
          {dirty ? 'Enregistrer' : 'Enregistré'}
        </button>
      </div>
    </Shell>
  )
}
