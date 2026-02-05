import { create } from 'zustand'
import { templates, type TemplateType, type Template } from './templates'

export interface EditorState {
  // Type and template
  type: TemplateType
  templateIndex: number
  
  // Content
  title: string
  quote: string
  author: string
  
  // Visuals
  backgroundImage: string | null
  customLogo: string | null
  frameColor: string
  textColor: string
  overlayColor: string
  overlayOpacity: number
  
  // AI Generation state
  isGenerating: boolean
  generatingText: boolean
  generatingImage: boolean
  
  // Actions
  setType: (type: TemplateType) => void
  setTemplateIndex: (index: number) => void
  setTitle: (title: string) => void
  setQuote: (quote: string) => void
  setAuthor: (author: string) => void
  setBackgroundImage: (url: string | null) => void
  setCustomLogo: (url: string | null) => void
  setFrameColor: (color: string) => void
  setTextColor: (color: string) => void
  setOverlayColor: (color: string) => void
  setOverlayOpacity: (opacity: number) => void
  setIsGenerating: (generating: boolean) => void
  setGeneratingText: (generating: boolean) => void
  setGeneratingImage: (generating: boolean) => void
  
  // Computed
  getCurrentTemplate: () => Template
  
  // Batch updates for AI generation
  setGeneratedContent: (content: { quote: string; author: string; title?: string }) => void
  setGeneratedImage: (url: string) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  type: 'jour',
  templateIndex: 0,
  title: 'Pensée du Jour',
  quote: 'La vie est ce que nous en faisons. Les voyages sont les voyageurs. Ce que nous voyons n\'est pas ce que nous voyons mais ce que nous sommes.',
  author: '',
  backgroundImage: null,
  customLogo: null,
  frameColor: '#d4af37',
  textColor: '#ffffff',
  overlayColor: '#000000',
  overlayOpacity: 50,
  isGenerating: false,
  generatingText: false,
  generatingImage: false,
  
  // Actions
  setType: (type) => set((state) => {
    let title = 'Pensée du Jour'
    let quote = state.quote
    let author = state.author
    
    if (type === 'saint') {
      title = 'Pensée de Saint'
    } else if (type === 'ciel') {
      title = ''
      quote = ''
      author = ''
    } else if (type === 'evangile') {
      title = "L'Évangile Illustré"
      quote = ''
      author = ''
    }
    
    return {
      type,
      templateIndex: 0,
      title,
      quote,
      author,
      backgroundImage: null,
    }
  }),
  
  setTemplateIndex: (templateIndex) => set({ templateIndex }),
  setTitle: (title) => set({ title }),
  setQuote: (quote) => set({ quote }),
  setAuthor: (author) => set({ author }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
  setCustomLogo: (customLogo) => set({ customLogo }),
  setFrameColor: (frameColor) => set({ frameColor }),
  setTextColor: (textColor) => set({ textColor }),
  setOverlayColor: (overlayColor) => set({ overlayColor }),
  setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGeneratingText: (generatingText) => set({ generatingText }),
  setGeneratingImage: (generatingImage) => set({ generatingImage }),
  
  // Computed
  getCurrentTemplate: () => {
    const state = get()
    return templates[state.type][state.templateIndex]
  },
  
  // Batch updates
  setGeneratedContent: (content) => set((state) => ({
    quote: content.quote,
    author: content.author,
    // For "ciel" type, also set the title if provided
    title: content.title || state.title,
    generatingText: false,
  })),
  
  setGeneratedImage: (url) => set({
    backgroundImage: url,
    generatingImage: false,
  }),
}))

// Initialize custom logo from localStorage (client-side only)
if (typeof window !== 'undefined') {
  const savedLogo = localStorage.getItem('vds-custom-logo')
  if (savedLogo) {
    useEditorStore.getState().setCustomLogo(savedLogo)
  }
}
