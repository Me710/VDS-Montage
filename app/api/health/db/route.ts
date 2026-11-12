import { NextResponse } from 'next/server'
import { isDatabaseConfigured, query } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Vérifie que l'application joint bien la base PostgreSQL.
// Ne renvoie aucune information sensible (ni hôte, ni identifiants).
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'DATABASE_URL is not configured' },
      { status: 503 }
    )
  }

  try {
    const rows = await query<{ now: string }>('SELECT now() AS now')
    return NextResponse.json({ ok: true, now: rows[0]?.now })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Database unreachable' },
      { status: 503 }
    )
  }
}
