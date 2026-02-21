'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Sparkles, MessageSquare, Image, Wand2, Loader2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIGeneratePanel() {
  const {
    type,
    title,
    generatingText,
    generatingImage,
    isGenerating,
    setGeneratingText,
    setGeneratingImage,
    setIsGenerating,
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

  const generateText = async () => {
    setError(null)
    setGeneratingText(true)

    try {
      const response = await fetch('/api/generate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate text')
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de génération')
      setGeneratingText(false)
    }
  }

  const generateImage = async () => {
    setError(null)
    setGeneratingImage(true)

    try {
      const template = getCurrentTemplate()
      // Pour l'évangile, on passe le titre comme contexte pour une image pertinente
      const context = type === 'evangile' && title && title !== "L'Évangile Illustré" ? title : undefined
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, style: template.style, context }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de génération')
      setGeneratingImage(false)
    }
  }

  const generateAll = async () => {
    setError(null)
    setIsGenerating(true)

    try {
      // Generate text and image in parallel
      await Promise.all([
        generateText(),
        generateImage(),
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  // Fetch Gospel of the day from AELF.org
  const fetchEvangileOfDay = async (useFullText: boolean = false) => {
    setError(null)
    setFetchingEvangile(true)

    try {
      const response = await fetch('/api/evangile')
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la récupération de l'évangile")
      }

      const data = await response.json()
      
      // Select appropriate style:
      // - "Verset clé" → Style "Avec Verset" (index 1): Titre + Extrait + Référence
      // - "Texte complet" → Style "Narratif" (index 2): Titre + Texte complet + Référence
      if (useFullText) {
        setTemplateIndex(2) // Narratif style
        setQuote(data.fullText)
      } else {
        setTemplateIndex(1) // Avec Verset style
        setQuote(data.shortVerse)
      }
      
      // All styles now include title
      setTitle(data.title)
      setAuthor(data.reference)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion à AELF.org")
    } finally {
      setFetchingEvangile(false)
    }
  }

  const isEvangileType = type === 'evangile'

  return (
    <div className="section-card space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Génération IA</h3>
      </div>

      {/* Quick Generate - All at once */}
      <button
        onClick={generateAll}
        disabled={isGenerating}
        className={cn(
          'btn-ai w-full py-2 text-sm',
          isGenerating && 'ai-generating'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Tout Générer
          </>
        )}
      </button>

      {/* Individual generation buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={generateText}
          disabled={generatingText || isGenerating}
          className="btn-secondary text-xs py-2"
        >
          {generatingText ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
          Texte
        </button>
        
        <button
          onClick={generateImage}
          disabled={generatingImage || isGenerating}
          className="btn-secondary text-xs py-2"
        >
          {generatingImage ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Image className="w-3.5 h-3.5" />
          )}
          Image
        </button>
      </div>

      {/* Evangile du jour button - only for evangile type */}
      {isEvangileType && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-white/80">AELF.org - Évangile du jour</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fetchEvangileOfDay(false)}
              disabled={fetchingEvangile}
              className="btn-secondary text-xs py-2 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
            >
              {fetchingEvangile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              Verset clé
            </button>
            <button
              onClick={() => fetchEvangileOfDay(true)}
              disabled={fetchingEvangile}
              className="btn-secondary text-xs py-2 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
            >
              {fetchingEvangile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              Texte complet
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
