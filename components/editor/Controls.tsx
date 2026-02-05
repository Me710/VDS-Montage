'use client'

import { useEditorStore } from '@/lib/store'

export function Controls() {
  const {
    title,
    quote,
    author,
    frameColor,
    textColor,
    overlayColor,
    overlayOpacity,
    setTitle,
    setQuote,
    setAuthor,
    setFrameColor,
    setTextColor,
    setOverlayColor,
    setOverlayOpacity,
  } = useEditorStore()

  return (
    <div className="section-card space-y-3 p-4">
      <h3 className="text-sm font-semibold text-white">Contenu</h3>

      {/* Title input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-white/60">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          className="input-field text-sm py-2"
          placeholder="Titre"
        />
      </div>

      {/* Quote input */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-white/60">Citation</label>
          <span className="text-[10px] text-white/40">{quote.length}/300</span>
        </div>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          maxLength={300}
          rows={3}
          className="textarea-field text-sm py-2"
          placeholder="Citation..."
        />
      </div>

      {/* Author input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-white/60">Auteur</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={50}
          className="input-field text-sm py-2"
          placeholder="Auteur (optionnel)"
        />
      </div>

      {/* Visual controls */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        <h4 className="text-xs font-semibold text-white">Couleurs</h4>

        {/* Color pickers in a grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Frame color */}
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">Cadre</label>
            <input
              type="color"
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>

          {/* Text color */}
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">Texte</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>

          {/* Overlay color */}
          <div className="space-y-1">
            <label className="text-[10px] text-white/50">Overlay</label>
            <input
              type="color"
              value={overlayColor}
              onChange={(e) => setOverlayColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Overlay opacity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-white/60">Opacité</label>
            <span className="text-xs text-primary font-medium">{overlayOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
            className="slider w-full"
          />
        </div>
      </div>
    </div>
  )
}
