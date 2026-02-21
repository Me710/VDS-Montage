import { NextRequest, NextResponse } from 'next/server'
import { generateImageWithGemini, type ContentType } from '@/lib/gemini'

// Force dynamic - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = body.type as ContentType
    const style = body.style as string || 'beautiful'
    const context = body.context as string | undefined

    if (!type || !['jour', 'saint', 'ciel', 'evangile'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "jour", "saint", "ciel" or "evangile"' },
        { status: 400 }
      )
    }

    const imageUrl = await generateImageWithGemini(type, style, context)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    
    if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate image: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
