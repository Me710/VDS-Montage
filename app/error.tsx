'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4" aria-hidden>⚠️</div>
        <h2 className="text-xl font-bold mb-2">Une erreur est survenue</h2>
        <p className="text-white/60 mb-6 text-sm">
          L&apos;application a rencontré un problème inattendu. Votre travail en cours n&apos;a peut-être pas été conservé.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8962f] text-[#1a1a2e] font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          Réessayer
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="block mx-auto mt-4 text-sm text-white/60 underline underline-offset-4 hover:text-white"
        >
          Recharger la page
        </button>
      </div>
    </div>
  )
}
