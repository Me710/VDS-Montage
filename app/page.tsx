'use client'

import { useRef, useState } from 'react'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { Canvas } from '@/components/editor/Canvas'
import { TemplateSelector } from '@/components/editor/TemplateSelector'
import { Controls } from '@/components/editor/Controls'
import { AIGeneratePanel } from '@/components/ai/AIGeneratePanel'
import { ImageGallery } from '@/components/gallery/ImageGallery'
import { LogoUploader } from '@/components/gallery/LogoUploader'
import { ShareButtons } from '@/components/share/ShareButtons'
import { useEditorStore, type CanvasFormat } from '@/lib/store'
import { Sparkles, LayoutTemplate, Image, Wand2, Share2, Type, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Icons for format buttons
function IconSquare() {
  return <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}
function IconLandscape() {
  return <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true"><rect x="1" y="4" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}
function IconPortrait() {
  return <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" aria-hidden="true"><rect x="4" y="1" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}

const FORMAT_OPTIONS: { id: CanvasFormat; label: string; icon: React.ReactNode }[] = [
  { id: '1:1',  label: '1:1',  icon: <IconSquare /> },
  { id: '16:9', label: '16:9', icon: <IconLandscape /> },
  { id: '9:16', label: '9:16', icon: <IconPortrait /> },
]

function FormatSelector() {
  const { canvasFormat, setCanvasFormat } = useEditorStore()
  return (
    <div
      role="group"
      aria-label="Format du visuel"
      className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10"
    >
      {FORMAT_OPTIONS.map(f => (
        <button
          type="button"
          key={f.id}
          onClick={() => setCanvasFormat(f.id)}
          title={`Format ${f.id}`}
          aria-label={`Format ${f.id}`}
          aria-pressed={canvasFormat === f.id}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
            canvasFormat === f.id
              ? 'bg-primary text-dark'
              : 'text-white/50 hover:text-white'
          )}
        >
          {f.icon}
          <span className="hidden sm:inline">{f.label}</span>
        </button>
      ))}
    </div>
  )
}

// Mobile tab type
type MobileTab = 'templates' | 'ai' | 'gallery' | 'controls' | 'share'

const MOBILE_TABS: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  { id: 'templates', label: 'Type', icon: <LayoutTemplate className="w-4 h-4" aria-hidden /> },
  { id: 'ai', label: 'IA', icon: <Wand2 className="w-4 h-4" aria-hidden /> },
  { id: 'gallery', label: 'Images', icon: <Image className="w-4 h-4" aria-hidden /> },
  { id: 'controls', label: 'Texte', icon: <Type className="w-4 h-4" aria-hidden /> },
  { id: 'share', label: 'Partage', icon: <Share2 className="w-4 h-4" aria-hidden /> },
]

function AiBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center bg-purple-500/20 rounded-full border border-purple-500/30',
        compact ? 'gap-1 px-1.5 py-0.5' : 'gap-1.5 px-2 py-1'
      )}
    >
      <Sparkles className="w-3 h-3 text-purple-400" aria-hidden />
      <span className={cn('text-purple-300', compact ? 'text-[10px]' : 'text-xs')}>IA</span>
    </div>
  )
}

function DesktopLayout() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <div className="flex flex-1 gap-3 min-h-0">
      {/* Left sidebar - Scrollable */}
      <aside
        aria-label="Contenu et génération"
        className="w-72 xl:w-80 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin flex-shrink-0"
      >
        <TemplateSelector />
        <AIGeneratePanel />
        <Controls />
      </aside>

      {/* Center - Canvas with header */}
      <section aria-label="Aperçu" className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 flex items-center justify-between gap-3 mb-3 py-2">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-vds.png"
              alt=""
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">VDS Montage</h1>
              <p className="text-xs text-white/50">Créateur de citations</p>
            </div>
            <AiBadge />
          </div>
          <FormatSelector />
        </header>

        <div className="flex-1 flex items-center justify-center min-h-0">
          <Canvas ref={canvasRef} />
        </div>
      </section>

      {/* Right sidebar - Scrollable */}
      <aside
        aria-label="Images et partage"
        className="w-72 xl:w-80 flex flex-col gap-3 overflow-y-auto pl-1 scrollbar-thin flex-shrink-0"
      >
        <ImageGallery />
        <LogoUploader />
        <ShareButtons canvasRef={canvasRef} />
      </aside>
    </div>
  )
}

function MobileLayout() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<MobileTab>('ai')
  const [showMobilePanel, setShowMobilePanel] = useState(true)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="flex-shrink-0 flex items-center justify-between gap-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo-vds.png"
            alt=""
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-lg font-bold text-white leading-tight">VDS Montage</h1>
          <AiBadge compact />
        </div>
        <FormatSelector />
      </header>

      {/* Canvas - Takes remaining space */}
      <div className="flex-1 flex items-center justify-center min-h-0 mb-2">
        <Canvas ref={canvasRef} />
      </div>

      {/* Mobile Bottom Panel */}
      <div className="flex-shrink-0 bg-dark-light/50 backdrop-blur-lg rounded-t-2xl border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowMobilePanel(!showMobilePanel)}
          aria-expanded={showMobilePanel}
          aria-controls="mobile-panel"
          aria-label={showMobilePanel ? 'Réduire le panneau' : 'Afficher le panneau'}
          className="w-full flex items-center justify-center py-2 text-white/50 hover:text-white transition-colors"
        >
          {showMobilePanel ? (
            <ChevronDown className="w-5 h-5" aria-hidden />
          ) : (
            <ChevronUp className="w-5 h-5" aria-hidden />
          )}
        </button>

        {showMobilePanel && (
          <div id="mobile-panel">
            {/* Tab Navigation */}
            <div role="tablist" aria-label="Sections" className="flex border-b border-white/10 px-2 overflow-x-auto scrollbar-thin">
              {MOBILE_TABS.map((tab) => (
                <button
                  type="button"
                  role="tab"
                  key={tab.id}
                  id={`mobile-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls="mobile-tabpanel"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2',
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-white/60 border-transparent hover:text-white'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div
              role="tabpanel"
              id="mobile-tabpanel"
              aria-labelledby={`mobile-tab-${activeTab}`}
              className="max-h-[40vh] overflow-y-auto p-3 scrollbar-thin"
            >
              {activeTab === 'templates' && <TemplateSelector />}
              {activeTab === 'ai' && <AIGeneratePanel />}
              {activeTab === 'gallery' && (
                <div className="space-y-3">
                  <ImageGallery />
                  <LogoUploader />
                </div>
              )}
              {activeTab === 'controls' && <Controls />}
              {activeTab === 'share' && <ShareButtons canvasRef={canvasRef} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LayoutSkeleton() {
  return (
    <div role="status" className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="loading-spinner" aria-hidden />
      <p className="text-sm text-white/60">Chargement de l&apos;éditeur...</p>
    </div>
  )
}

export default function Home() {
  // Une seule mise en page est montée (bureau OU mobile). Auparavant les deux
  // arbres étaient rendus en permanence et masqués en CSS : deux canvas, tout
  // dessiné deux fois, et l'export pouvait viser le canvas masqué.
  const isDesktop = useIsDesktop()

  return (
    <main className="h-dvh flex flex-col overflow-hidden p-2 md:p-3">
      {isDesktop === null ? <LayoutSkeleton /> : isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </main>
  )
}
