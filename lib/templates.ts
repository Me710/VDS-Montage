export type TemplateType = 'jour' | 'saint' | 'ciel' | 'evangile'

export type FrameStyle = 'circular' | 'geometric' | 'elegant' | 'ornate' | 'geometric-sacred' | 'regard-ciel' | 'regard-ciel-nom' | 'regard-ciel-citation' | 'evangile-simple' | 'evangile-verset' | 'evangile-narratif'

export interface Template {
  id: string
  name: string
  icon: string
  style: string
  defaultBg: string
  frameStyle: FrameStyle
  frameColor: string
  overlayGradient: string
  titleFont: string
  titleSize: number
  quoteFont: string
  quoteSize: number
  authorFont: string
  authorSize: number
}

export interface GalleryImage {
  url: string
  name: string
  category: string
}

export const templates: Record<TemplateType, Template[]> = {
  jour: [
    {
      id: 'jour-1',
      name: 'Minimaliste Élégant',
      icon: 'circle',
      style: 'minimalist',
      defaultBg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop',
      frameStyle: 'circular',
      frameColor: '#d4af37',
      overlayGradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(105, 105, 105, 0.3))',
      titleFont: 'Playfair Display',
      titleSize: 48,
      quoteFont: 'Inter',
      quoteSize: 32,
      authorFont: 'Inter',
      authorSize: 24
    },
    {
      id: 'jour-2',
      name: 'Géométrique Moderne',
      icon: 'square',
      style: 'geometric',
      defaultBg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1024&h=1024&fit=crop',
      frameStyle: 'geometric',
      frameColor: '#d4af37',
      overlayGradient: 'linear-gradient(180deg, rgba(30, 30, 30, 0.7), rgba(60, 60, 60, 0.5))',
      titleFont: 'Inter',
      titleSize: 44,
      quoteFont: 'Inter',
      quoteSize: 30,
      authorFont: 'Inter',
      authorSize: 22
    },
    {
      id: 'jour-3',
      name: 'Artistique Lumineux',
      icon: 'star',
      style: 'artistic',
      defaultBg: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop',
      frameStyle: 'elegant',
      frameColor: '#d4af37',
      overlayGradient: 'radial-gradient(circle, rgba(212, 175, 55, 0.15), rgba(0, 51, 102, 0.4))',
      titleFont: 'Playfair Display',
      titleSize: 46,
      quoteFont: 'Inter',
      quoteSize: 31,
      authorFont: 'Playfair Display',
      authorSize: 23
    }
  ],
  saint: [
    {
      id: 'saint-1',
      name: 'Spirituel Sophistiqué',
      icon: 'cross',
      style: 'spiritual',
      defaultBg: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1024&h=1024&fit=crop',
      frameStyle: 'ornate',
      frameColor: '#d4af37',
      overlayGradient: 'linear-gradient(180deg, rgba(25, 25, 112, 0.6), rgba(0, 0, 0, 0.5))',
      titleFont: 'Playfair Display',
      titleSize: 50,
      quoteFont: 'Inter',
      quoteSize: 32,
      authorFont: 'Playfair Display',
      authorSize: 26
    },
    {
      id: 'saint-2',
      name: 'Contemporain Sacré',
      icon: 'church',
      style: 'contemporary',
      defaultBg: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1024&h=1024&fit=crop',
      frameStyle: 'geometric-sacred',
      frameColor: '#d4af37',
      overlayGradient: 'linear-gradient(135deg, rgba(0, 0, 128, 0.5), rgba(25, 25, 25, 0.6))',
      titleFont: 'Inter',
      titleSize: 46,
      quoteFont: 'Inter',
      quoteSize: 30,
      authorFont: 'Inter',
      authorSize: 24
    },
    {
      id: 'saint-3',
      name: 'Raffiné Céleste',
      icon: 'cloud',
      style: 'celestial',
      defaultBg: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1024&h=1024&fit=crop',
      frameStyle: 'elegant',
      frameColor: '#d4af37',
      overlayGradient: 'linear-gradient(160deg, rgba(75, 0, 130, 0.5), rgba(30, 144, 255, 0.4))',
      titleFont: 'Playfair Display',
      titleSize: 48,
      quoteFont: 'Inter',
      quoteSize: 31,
      authorFont: 'Playfair Display',
      authorSize: 25
    }
  ],
  ciel: [
    {
      id: 'ciel-1',
      name: 'Simple',
      icon: 'eye',
      style: 'simple',
      defaultBg: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1024&h=1024&fit=crop',
      frameStyle: 'regard-ciel',
      frameColor: '#2d6a4f',
      overlayGradient: 'none',
      titleFont: 'Inter',
      titleSize: 0,
      quoteFont: 'Inter',
      quoteSize: 0,
      authorFont: 'Inter',
      authorSize: 0
    },
    {
      id: 'ciel-2',
      name: 'Avec Nom',
      icon: 'user',
      style: 'with-name',
      defaultBg: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1024&h=1024&fit=crop',
      frameStyle: 'regard-ciel-nom',
      frameColor: '#2d6a4f',
      overlayGradient: 'none',
      titleFont: 'Playfair Display',
      titleSize: 36,
      quoteFont: 'Inter',
      quoteSize: 0,
      authorFont: 'Inter',
      authorSize: 0
    },
    {
      id: 'ciel-3',
      name: 'Avec Citation',
      icon: 'quote',
      style: 'with-quote',
      defaultBg: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1024&h=1024&fit=crop',
      frameStyle: 'regard-ciel-citation',
      frameColor: '#2d6a4f',
      overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)',
      titleFont: 'Playfair Display',
      titleSize: 28,
      quoteFont: 'Inter',
      quoteSize: 24,
      authorFont: 'Inter',
      authorSize: 20
    }
  ],
  evangile: [
    {
      id: 'evangile-1',
      name: 'Simple',
      icon: 'book-open',
      style: 'simple',
      defaultBg: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1024&h=1024&fit=crop',
      frameStyle: 'evangile-simple',
      frameColor: '#8B4513',
      overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
      titleFont: 'Playfair Display',
      titleSize: 32,
      quoteFont: 'Inter',
      quoteSize: 0,
      authorFont: 'Inter',
      authorSize: 24
    },
    {
      id: 'evangile-2',
      name: 'Avec Verset',
      icon: 'scroll-text',
      style: 'with-verse',
      defaultBg: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1024&h=1024&fit=crop',
      frameStyle: 'evangile-verset',
      frameColor: '#8B4513',
      overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
      titleFont: 'Playfair Display',
      titleSize: 28,
      quoteFont: 'Playfair Display',
      quoteSize: 22,
      authorFont: 'Inter',
      authorSize: 20
    },
    {
      id: 'evangile-3',
      name: 'Narratif',
      icon: 'file-text',
      style: 'narrative',
      defaultBg: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1024&h=1024&fit=crop',
      frameStyle: 'evangile-narratif',
      frameColor: '#8B4513',
      overlayGradient: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.9) 100%)',
      titleFont: 'Playfair Display',
      titleSize: 26,
      quoteFont: 'Inter',
      quoteSize: 18,
      authorFont: 'Inter',
      authorSize: 18
    }
  ]
}

export const galleryImages: Record<TemplateType, GalleryImage[]> = {
  jour: [
    { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop', name: 'Montagne au Lever', category: 'nature' },
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1024&h=1024&fit=crop', name: 'Océan Doré', category: 'nature' },
    { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1024&h=1024&fit=crop', name: 'Forêt Lumineuse', category: 'nature' },
    { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024&h=1024&fit=crop', name: 'Lac Paisible', category: 'nature' },
    { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1024&h=1024&fit=crop', name: 'Route Inspirante', category: 'nature' },
    { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1024&h=1024&fit=crop', name: 'Ciel Étoilé', category: 'nature' },
    { url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1024&h=1024&fit=crop', name: 'Prairie Dorée', category: 'nature' }
  ],
  saint: [
    { url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1024&h=1024&fit=crop', name: 'Cathédrale Divine', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=1024&h=1024&fit=crop', name: 'Monastère Ancien', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1024&h=1024&fit=crop', name: 'Nuages Célestes', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1024&h=1024&fit=crop', name: 'Lumière Divine', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1504551591408-94a57e84ff1e?w=1024&h=1024&fit=crop', name: 'Vitraux Sacrés', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1024&h=1024&fit=crop', name: 'Cloître Paisible', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=1024&h=1024&fit=crop', name: 'Ciel Mystique', category: 'spiritual' },
    { url: 'https://images.unsplash.com/photo-1445810694374-0a94739e4a03?w=1024&h=1024&fit=crop', name: 'Chapelle Lumineuse', category: 'spiritual' }
  ],
  ciel: [
    { url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=1024&h=1024&fit=crop', name: 'Vierge Marie', category: 'saints' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop', name: 'Croix Lumineuse', category: 'saints' },
    { url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1024&h=1024&fit=crop', name: 'Ange Gardien', category: 'saints' },
    { url: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1024&h=1024&fit=crop', name: 'Sacré Cœur', category: 'saints' },
    { url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1024&h=1024&fit=crop', name: 'Lumière Céleste', category: 'saints' },
    { url: 'https://images.unsplash.com/photo-1504551591408-94a57e84ff1e?w=1024&h=1024&fit=crop', name: 'Vitrail Sacré', category: 'saints' }
  ],
  evangile: [
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1024&h=1024&fit=crop', name: 'Paysage Biblique', category: 'biblical' },
    { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1024&h=1024&fit=crop', name: 'Chemin de Lumière', category: 'biblical' },
    { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1024&h=1024&fit=crop', name: 'Vallée Paisible', category: 'biblical' },
    { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1024&h=1024&fit=crop', name: 'Montagne Sacrée', category: 'biblical' },
    { url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1024&h=1024&fit=crop', name: 'Champs Dorés', category: 'biblical' },
    { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1024&h=1024&fit=crop', name: 'Lac au Crépuscule', category: 'biblical' }
  ]
}
