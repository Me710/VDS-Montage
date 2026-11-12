import { NextRequest, NextResponse } from 'next/server'
import { generateQuoteAndAuthor, type ContentType } from '@/lib/claude'

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0
// Le service gratuit impose un délai entre deux requêtes : on laisse le temps aux retries
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = body.type as ContentType

    if (!type || !['jour', 'saint', 'ciel', 'evangile', 'histoire'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "jour", "saint", "ciel", "evangile" or "histoire"' },
        { status: 400 }
      )
    }

    const content = await generateQuoteAndAuthor(type)

    return NextResponse.json(content)
  } catch (error) {
    console.error('Text generation error:', error)
    
    return NextResponse.json(
      { error: 'Échec de la génération du texte. Merci de réessayer dans quelques secondes.' },
      { status: 500 }
    )
  }
}
