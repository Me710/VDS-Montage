'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { apiFetch, errorMessage } from '@/lib/api-client'
import { toast } from '@/lib/toast-store'
import { Sparkles, MessageSquare, Image, Wand2, Loader2, BookOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeneratedText {
  quote: string
  author: string
  title?: string
}

interface EvangileOfDay {
  title: string
  reference: string
  shortVerse: string
  fullText: string
}

// Le service gratuit peut faire patienter jusqu'à ~30 s entre deux requêtes
const GENERATION_TIMEOUT_MS = 160_000

export function AIGeneratePanel() {
  const {
    type,
    title,
    generatingText,
    generatingImage,
    setGeneratingText,
    setGeneratingImage,
    setGeneratedContent,
    setGeneratedImage,
    getCurrentTemplate,
    setTitle,
    setQuote,
    setAuthor,
    setTemplateIndex,
  } = useEditorStore()

  const [error, setError] = useState<string | null>(null)
  const [fetchingEvangile, setFetchingEvangile] = useState(false)

  const busy = generatingText || generatingImage

  // Chaque générateur renvoie null en cas de succès, sinon le message d'erreur.
  // L'état « en cours » est toujours remis à zéro (finally), succès ou échec.
  const runTextGeneration = async (): Promise<string | null> => {
    setGeneratingText(true)
    try {
      const data = await apiFetch<GeneratedText>('/api/generate/text', {
        method: 'POST',
        body: { type },
        timeoutMs: GENERATION_TIMEOUT_MS,
        fallbackMessage: 'La génération du texte a échoué. Merci de réessayer.',
      })
      if (typeof data.quote !== 'string' || !data.quote.trim()) {
        return 'Le texte généré est vide. Merci de réessayer.'
      }
      setGeneratedContent({
        quote: data.quote,
        author: typeof data.author === 'string' ? data.author : '',
        title: typeof data.title === 'string' ? data.title : undefined,
      })
      return null
    } catch (err) {
      return errorMessage(err, 'La génération du texte a échoué. Merci de réessayer.')
    } finally {
      setGeneratingText(false)
    }
  }

  const runImageGeneration = async (): Promise<string | null> => {
    setGeneratingImage(true)
    try {
      const template = getCurrentTemplate()
      // Pour l'évangile ou l'histoire, on passe le titre comme contexte pour une image pertinente
      const context = (type === 'evangile' && title && title !== "L'Évangile Illustré") ? title
        : (type === 'histoire' && title) ? title
        : undefined
      const data = await apiFetch<{ imageUrl: string }>('/api/generate/image', {
        method: 'POST',
        body: { type, style: template?.style, context },
        timeoutMs: GENERATION_TIMEOUT_MS,
        fallbackMessage: "La génération de l'image a échoué. Merci de réessayer.",
      })
      if (typeof data.imageUrl !== 'string' || !data.imageUrl) {
        return "L'image générée est vide. Merci de réessayer."
      }
      setGeneratedImage(data.imageUrl)
      return null
    } catch (err) {
      return errorMessage(err, "La génération de l'image a échoué. Merci de réessayer.")
    } finally {
      setGeneratingImage(false)
    }
  }

  const report = (errors: (string | null)[], successMessage: string) => {
    const failures = Array.from(new Set(errors.filter((e): e is string => Boolean(e))))
    if (failures.length === 0) {
      setError(null)
      toast.success(successMessage)
    } else {
      setError(failures.join(' '))
    }
  }

  const generateText = async () => {
    if (busy) return
    setError(null)
    report([await runTextGeneration()], 'Texte généré.')
  }

  const generateImage = async () => {
    if (busy) return
    setError(null)
    report([await runImageGeneration()], 'Image générée.')
  }

  const generateAll = async () => {
    if (busy) return
    setError(null)
    // Texte et image en parallèle ; un échec de l'un n'annule pas l'autre
    const results = await Promise.all([runTextGeneration(), runImageGeneration()])
    report(results, 'Texte et image générés.')
  }

  // Fetch Gospel of the day from AELF.org
  const fetchEvangileOfDay = async (useFullText: boolean = false) => {
    if (fetchingEvangile) return
    setError(null)
    setFetchingEvangile(true)

    try {
      const data = await apiFetch<EvangileOfDay>('/api/evangile', {
        timeoutMs: 20_000,
        fallbackMessage: "Impossible de récupérer l'évangile du jour. Merci de réessayer.",
      })

      // Select appropriate style:
      // - "Verset clé" → Style "Avec Verset" (index 1): Titre + Extrait + Référence
      // - "Texte complet" → Style "Narratif" (index 2): Titre + Texte complet + Référence
      if (useFullText) {
        setTemplateIndex(2) // Narratif style
        setQuote(data.fullText ?? '')
      } else {
        setTemplateIndex(1) // Avec Verset style
        setQuote(data.shortVerse ?? '')
      }

      // All styles now include title
      setTitle(data.title ?? '')
      setAuthor(data.reference ?? '')
      toast.success('Évangile du jour chargé.')
    } catch (err) {
      setError(errorMessage(err, "Impossible de récupérer l'évangile du jour. Merci de réessayer."))
    } finally {
      setFetchingEvangile(false)
    }
  }

  const isEvangileType = type === 'evangile'
  const generatingAll = generatingText && generatingImage

  return (
    <div className="section-card space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" aria-hidden />
        <h3 className="text-sm font-semibold text-white">Génération IA</h3>
      </div>

      {/* Quick Generate - All at once */}
      <button
        type="button"
        onClick={generateAll}
        disabled={busy}
        aria-busy={generatingAll}
        className={cn(
          'btn-ai w-full py-2 text-sm',
          generatingAll && 'ai-generating'
        )}
      >
        {generatingAll ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Génération...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" aria-hidden />
            Tout Générer
          </>
        )}
      </button>

      {/* Individual generation buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={generateText}
          disabled={busy}
          aria-busy={generatingText}
          className="btn-secondary text-xs py-2"
        >
          {generatingText ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" aria-hidden />
          )}
          Texte
        </button>

        <button
          type="button"
          onClick={generateImage}
          disabled={busy}
          aria-busy={generatingImage}
          className="btn-secondary text-xs py-2"
        >
          {generatingImage ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
          ) : (
            <Image className="w-3.5 h-3.5" aria-hidden />
          )}
          Image
        </button>
      </div>

      {/* Attente : le service gratuit peut être lent, on le dit clairement */}
      {busy && (
        <p role="status" className="text-[11px] leading-snug text-white/50">
          Génération en cours. Le service gratuit peut prendre jusqu&apos;à une minute.
        </p>
      )}

      {/* Evangile du jour button - only for evangile type */}
      {isEvangileType && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" aria-hidden />
            <span className="text-xs font-medium text-white/80">AELF.org - Évangile du jour</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fetchEvangileOfDay(false)}
              disabled={fetchingEvangile}
              className="btn-secondary text-xs py-2 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
            >
              {fetchingEvangile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
              ) : (
                <BookOpen className="w-3.5 h-3.5" aria-hidden />
              )}
              Verset clé
            </button>
            <button
              type="button"
              onClick={() => fetchEvangileOfDay(true)}
              disabled={fetchingEvangile}
              className="btn-secondary text-xs py-2 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
            >
              {fetchingEvangile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
              ) : (
                <BookOpen className="w-3.5 h-3.5" aria-hidden />
              )}
              Texte complet
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs"
        >
          <span className="flex-1 leading-snug">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Fermer le message d'erreur"
            className="text-red-300/70 hover:text-red-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
