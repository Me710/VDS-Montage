'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/store'
import { Sparkles, MessageSquare, Image, Wand2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIGeneratePanel() {
  const {
    type,
    generatingText,
    generatingImage,
    isGenerating,
    setGeneratingText,
    setGeneratingImage,
    setIsGenerating,
    setGeneratedContent,
    setGeneratedImage,
    getCurrentTemplate,
  } = useEditorStore()

  const [error, setError] = useState<string | null>(null)

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
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, style: template.style }),
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

      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}
