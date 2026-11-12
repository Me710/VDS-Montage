import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center text-white p-6 text-center">
      <h1 className="text-xl font-bold mb-2">Page introuvable</h1>
      <p className="text-white/60 mb-6 text-sm">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-primary">
        Retour à l&apos;éditeur
      </Link>
    </div>
  )
}
