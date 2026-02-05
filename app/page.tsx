'use client'

import { Canvas } from '@/components/editor/Canvas'
import { TemplateSelector } from '@/components/editor/TemplateSelector'
import { Controls } from '@/components/editor/Controls'
import { AIGeneratePanel } from '@/components/ai/AIGeneratePanel'
import { ImageGallery } from '@/components/gallery/ImageGallery'
import { LogoUploader } from '@/components/gallery/LogoUploader'
import { Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="h-screen flex flex-col overflow-hidden p-3">
      {/* Compact Header */}
      <header className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-dark font-bold text-sm">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">VDS Montage</h1>
            <p className="text-xs text-white/50">Créateur de citations</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-purple-300">AI</span>
        </div>
      </header>

      {/* Main content - Full height */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left sidebar - Scrollable */}
        <aside className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin">
          <TemplateSelector />
          <AIGeneratePanel />
          <Controls />
        </aside>

        {/* Center - Canvas */}
        <section className="col-span-6 flex items-center justify-center">
          <Canvas />
        </section>

        {/* Right sidebar - Scrollable */}
        <aside className="col-span-3 flex flex-col gap-3 overflow-y-auto pl-1 scrollbar-thin">
          <ImageGallery />
          <LogoUploader />
        </aside>
      </div>
    </main>
  )
}
