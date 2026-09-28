import { NextRequest, NextResponse } from 'next/server'
import { generateBackgroundImage } from '@/lib/pollinations'
import type { ContentType } from '@/lib/claude'

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0
// Pollinations peut prendre quelques secondes — on laisse jusqu'à 60s (max Vercel Hobby)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = body.type as ContentType
    const style = body.style as string || 'beautiful'
    const context = body.context as string | undefined

    if (!type || !['jour', 'saint', 'ciel', 'evangile', 'histoire'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "jour", "saint", "ciel", "evangile" or "histoire"' },
        { status: 400 }
      )
    }

    const imageUrl = await generateBackgroundImage(type, style, context)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)

    return NextResponse.json(
      { error: 'Failed to generate image: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
