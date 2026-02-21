'use client'

import { useRef, useState } from 'react'
import { Canvas } from '@/components/editor/Canvas'
import { TemplateSelector } from '@/components/editor/TemplateSelector'
import { Controls } from '@/components/editor/Controls'
import { AIGeneratePanel } from '@/components/ai/AIGeneratePanel'
import { ImageGallery } from '@/components/gallery/ImageGallery'
import { LogoUploader } from '@/components/gallery/LogoUploader'
import { ShareButtons } from '@/components/share/ShareButtons'
import { useEditorStore, type CanvasFormat } from '@/lib/store'
import { Sparkles, Settings, Image, Wand2, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Icons for format buttons
function IconSquare() {
  return <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}
function IconLandscape() {
  return <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="1" y="4" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}
function IconPortrait() {
  return <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="4" y="1" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
}

const FORMAT_OPTIONS: { id: CanvasFormat; label: string; icon: React.ReactNode }[] = [
  { id: '1:1',  label: '1:1',  icon: <IconSquare /> },
  { id: '16:9', label: '16:9', icon: <IconLandscape /> },
  { id: '9:16', label: '9:16', icon: <IconPortrait /> },
]

function FormatSelector() {
  const { canvasFormat, setCanvasFormat } = useEditorStore()
  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
      {FORMAT_OPTIONS.map(f => (
        <button
          key={f.id}
          onClick={() => setCanvasFormat(f.id)}
          title={f.id}
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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<MobileTab>('ai')
  const [showMobilePanel, setShowMobilePanel] = useState(true)

  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'templates', label: 'Type', icon: <Settings className="w-4 h-4" /> },
    { id: 'ai', label: 'IA', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'gallery', label: 'Images', icon: <Image className="w-4 h-4" /> },
    { id: 'controls', label: 'Texte', icon: <Settings className="w-4 h-4" /> },
    { id: 'share', label: 'Partage', icon: <Share2 className="w-4 h-4" /> },
  ]

  return (
    <main className="h-dvh flex flex-col overflow-hidden p-2 md:p-3">
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex flex-1 gap-3 min-h-0">
        {/* Left sidebar - Scrollable */}
        <aside className="w-72 xl:w-80 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin flex-shrink-0">
          <TemplateSelector />
          <AIGeneratePanel />
          <Controls />
        </aside>

        {/* Center - Canvas with header */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Centered Header */}
          <header className="flex-shrink-0 flex items-center justify-between gap-3 mb-3 py-2">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo-vds.png" 
                alt="VDS Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">VDS Montage</h1>
                <p className="text-xs text-white/50">Créateur de citations</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300">AI</span>
              </div>
            </div>
            <FormatSelector />
          </header>
          
          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center">
            <Canvas ref={canvasRef} />
          </div>
        </section>

        {/* Right sidebar - Scrollable */}
        <aside className="w-72 xl:w-80 flex flex-col gap-3 overflow-y-auto pl-1 scrollbar-thin flex-shrink-0">
          <ImageGallery />
          <LogoUploader />
          <ShareButtons canvasRef={canvasRef} />
        </aside>
      </div>

      {/* MOBILE/TABLET LAYOUT */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0">
        {/* Mobile Header */}
        <header className="flex-shrink-0 flex items-center justify-between gap-2 py-2 mb-2">
          <div className="flex items-center gap-2">
            <img 
              src="/images/logo-vds.png" 
              alt="VDS Logo" 
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-lg font-bold text-white leading-tight">VDS Montage</h1>
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 rounded-full border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-purple-300">AI</span>
            </div>
          </div>
          <FormatSelector />
        </header>

        {/* Canvas - Takes remaining space */}
        <div className="flex-1 flex items-center justify-center min-h-0 mb-2">
          <Canvas ref={canvasRef} />
        </div>

        {/* Mobile Bottom Panel */}
        <div className="flex-shrink-0 bg-dark-light/50 backdrop-blur-lg rounded-t-2xl border-t border-white/10">
          {/* Toggle Button */}
          <button 
            onClick={() => setShowMobilePanel(!showMobilePanel)}
            className="w-full flex items-center justify-center py-2 text-white/50 hover:text-white transition-colors"
          >
            {showMobilePanel ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>

          {showMobilePanel && (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10 px-2 overflow-x-auto scrollbar-thin">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'text-primary border-primary'
                        : 'text-white/60 border-transparent hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="max-h-[40vh] overflow-y-auto p-3 scrollbar-thin">
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
            </>
          )}
        </div>
      </div>
    </main>
  )
}
