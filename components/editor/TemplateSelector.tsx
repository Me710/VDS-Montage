'use client'

import { useEditorStore } from '@/lib/store'
import { templates, type TemplateType } from '@/lib/templates'
import { cn } from '@/lib/utils'
import { Circle, Square, Star, Cross, Church, Cloud, Eye, User, Quote, BookOpen, ScrollText, FileText, Scroll, LayoutList, Sparkles } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  circle: <Circle className="w-5 h-5" />,
  square: <Square className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  cross: <Cross className="w-5 h-5" />,
  church: <Church className="w-5 h-5" />,
  cloud: <Cloud className="w-5 h-5" />,
  eye: <Eye className="w-5 h-5" />,
  user: <User className="w-5 h-5" />,
  quote: <Quote className="w-5 h-5" />,
  'book-open': <BookOpen className="w-5 h-5" />,
  'scroll-text': <ScrollText className="w-5 h-5" />,
  'file-text': <FileText className="w-5 h-5" />,
  'scroll': <Scroll className="w-5 h-5" />,
  'layout-list': <LayoutList className="w-5 h-5" />,
  'sparkles': <Sparkles className="w-5 h-5" />,
}

export function TemplateSelector() {
  const { type, templateIndex, setType, setTemplateIndex } = useEditorStore()

  const currentTemplates = templates[type]

  return (
    <div className="section-card space-y-3 p-4">
      <h3 className="text-sm font-semibold text-white">Type de Publication</h3>
      
      {/* Type selector */}
      <div className="grid grid-cols-5 gap-1.5">
        <button
          onClick={() => setType('jour')}
          className={cn('type-btn py-2 text-[10px]', type === 'jour' && 'active')}
        >
          <Star className="w-3.5 h-3.5" />
          Jour
        </button>
        <button
          onClick={() => setType('saint')}
          className={cn('type-btn py-2 text-[10px]', type === 'saint' && 'active')}
        >
          <Cross className="w-3.5 h-3.5" />
          Saint
        </button>
        <button
          onClick={() => setType('ciel')}
          className={cn('type-btn py-2 text-[10px]', type === 'ciel' && 'active')}
        >
          <Eye className="w-3.5 h-3.5" />
          Ciel
        </button>
        <button
          onClick={() => setType('evangile')}
          className={cn('type-btn py-2 text-[10px]', type === 'evangile' && 'active')}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Évangile
        </button>
        <button
          onClick={() => setType('histoire')}
          className={cn('type-btn py-2 text-[10px]', type === 'histoire' && 'active')}
        >
          <Scroll className="w-3.5 h-3.5" />
          Histoire
        </button>
      </div>

      {/* Template selector */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white/60">Template</h4>
        <div className="grid grid-cols-3 gap-2">
          {currentTemplates.map((template, index) => (
            <button
              key={template.id}
              onClick={() => setTemplateIndex(index)}
              className={cn(
                'template-btn p-2',
                index === templateIndex && 'active'
              )}
            >
              {iconMap[template.icon] || <Circle className="w-4 h-4" />}
              <span className="text-[10px] text-center leading-tight">{template.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
