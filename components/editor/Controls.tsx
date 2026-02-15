'use client'

import { useEditorStore, AVAILABLE_FONTS } from '@/lib/store'
import { templates } from '@/lib/templates'

export function Controls() {
  const {
    type,
    templateIndex,
    title,
    quote,
    author,
    frameColor,
    textColor,
    overlayColor,
    overlayOpacity,
    customFontFamily,
    fontSizeOffset,
    setTitle,
    setQuote,
    setAuthor,
    setFrameColor,
    setTextColor,
    setOverlayColor,
    setOverlayOpacity,
    setCustomFontFamily,
    setFontSizeOffset,
  } = useEditorStore()

  const currentTemplate = templates[type][templateIndex]
  const isCielType = type === 'ciel'
  const isEvangileType = type === 'evangile'
  const isCielSimple = currentTemplate?.frameStyle === 'regard-ciel'
  const isCielNom = currentTemplate?.frameStyle === 'regard-ciel-nom'
  const isCielCitation = currentTemplate?.frameStyle === 'regard-ciel-citation'
  const isEvangileSimple = currentTemplate?.frameStyle === 'evangile-simple'
  const isEvangileVerset = currentTemplate?.frameStyle === 'evangile-verset'
  const isEvangileNarratif = currentTemplate?.frameStyle === 'evangile-narratif'

  // Labels based on type
  let titleLabel = 'Titre'
  let titlePlaceholder = 'Titre'
  let quotePlaceholder = 'Citation...'
  let authorLabel = 'Auteur'
  let authorPlaceholder = 'Auteur (optionnel)'
  
  if (isCielType) {
    titleLabel = 'Sujet'
    titlePlaceholder = 'Saint, église, scène biblique...'
    quotePlaceholder = 'Citation ou verset biblique...'
    if (isCielCitation) {
      authorLabel = 'Source'
      authorPlaceholder = 'Nom du saint'
    }
  } else if (isEvangileType) {
    titleLabel = 'Titre de la scène'
    titlePlaceholder = 'Le Bon Berger, Les Béatitudes...'
    quotePlaceholder = 'Verset de l\'Évangile...'
    authorLabel = 'Référence'
    authorPlaceholder = 'Jean 10:11'
  }

  // Show/hide fields based on style
  // All evangile styles now show title (Titre de la scène)
  // Simple = Titre + Verset (pas de texte)
  // Avec Verset = Titre + Extrait + Verset
  // Narratif = Titre + Texte complet + Verset
  const showTitle = !isCielSimple
  const showQuote = !isCielSimple && !isCielNom && !isEvangileSimple // Simple n'a pas d'extrait
  const showAuthor = !isCielSimple && !isCielNom

  // Get section title
  let sectionTitle = 'Contenu'
  if (isCielType) sectionTitle = 'Contenu #UnRegardAuCiel'
  else if (isEvangileType) sectionTitle = "L'Évangile Illustré"

  return (
    <div className="section-card space-y-3 p-4">
      <h3 className="text-sm font-semibold text-white">{sectionTitle}</h3>

      {/* Title input */}
      {showTitle && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-white/60">{titleLabel}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="input-field text-sm py-2"
            placeholder={titlePlaceholder}
          />
        </div>
      )}

      {/* Quote input */}
      {showQuote && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-white/60">
              {isEvangileType ? (isEvangileNarratif ? 'Évangile complet' : 'Verset') : 'Citation'}
            </label>
            <span className="text-[10px] text-white/40">
              {quote.length}/{isEvangileNarratif ? '1000' : '300'}
            </span>
          </div>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            maxLength={isEvangileNarratif ? 1000 : 300}
            rows={isEvangileNarratif ? 6 : 3}
            className="textarea-field text-sm py-2"
            placeholder={isEvangileNarratif ? "Texte complet de l'évangile du jour..." : quotePlaceholder}
          />
        </div>
      )}

      {/* Author input */}
      {showAuthor && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-white/60">{authorLabel}</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={50}
            className="input-field text-sm py-2"
            placeholder={authorPlaceholder}
          />
        </div>
      )}

      {/* Info message for simple ciel style */}
      {isCielSimple && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs text-green-400">
            Style simple : Uploadez ou générez une image religieuse (saint, église, scène biblique, relique...). Le hashtag #UnRegardAuCiel sera ajouté automatiquement.
          </p>
        </div>
      )}

      {/* Info message for evangile type */}
      {isEvangileType && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-xs text-amber-400">
            {isEvangileSimple && "Simple : Titre de la scène + Référence"}
            {isEvangileVerset && "Avec Verset : Titre + Extrait du texte + Référence"}
            {isEvangileNarratif && "Narratif : Titre + Texte complet de l'évangile + Référence"}
          </p>
        </div>
      )}

      {/* Typography controls */}
      <div className="pt-3 border-t border-white/10 space-y-3">
        <h4 className="text-xs font-semibold text-white">Typographie</h4>

        {/* Font family selector */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50">Police</label>
          <select
            value={customFontFamily}
            onChange={(e) => setCustomFontFamily(e.target.value)}
            className="input-field text-sm py-2 w-full"
            style={{ fontFamily: customFontFamily || undefined }}
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value || undefined }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font size offset slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-white/60">Taille de police</label>
            <span className="text-xs text-primary font-medium">
              {fontSizeOffset > 0 ? `+${fontSizeOffset}` : fontSizeOffset}px
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={fontSizeOffset}
            onChange={(e) => setFontSizeOffset(parseInt(e.target.value))}
            className="slider w-full"
          />
          <div className="flex justify-between text-[9px] text-white/30">
            <span>Plus petit</span>
            <span>Normal</span>
            <span>Plus grand</span>
          </div>
        </div>
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
