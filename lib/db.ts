import { Pool } from 'pg'

// ─── PostgreSQL (Railway) ────────────────────────────────────────────────────
// La chaîne de connexion est lue UNIQUEMENT depuis DATABASE_URL. Sur Railway,
// elle référence le service Postgres via le réseau privé (pas de SSL requis).

// Réutilise le pool entre les rechargements à chaud en développement.
const globalForPg = globalThis as unknown as { pgPool?: Pool }

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool(): Pool {
  if (!globalForPg.pgPool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured')
    }
    globalForPg.pgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  }
  return globalForPg.pgPool
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query(text, params)
  return result.rows as T[]
}
