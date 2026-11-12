'use client'

import { useEffect, useState } from 'react'

const DESKTOP_QUERY = '(min-width: 1024px)' // breakpoint `lg` de Tailwind

// Renvoie null tant que la taille d'écran n'est pas connue (rendu serveur et
// premier rendu client), puis true/false. Permet de ne monter qu'UNE seule
// mise en page au lieu de deux arbres complets masqués en CSS.
export function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const update = () => setIsDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isDesktop
}
