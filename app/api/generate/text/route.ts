import { NextRequest, NextResponse } from 'next/server'
import { generateQuoteAndAuthor, type ContentType } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = body.type as ContentType

    if (!type || !['jour', 'saint'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "jour" or "saint"' },
        { status: 400 }
      )
    }

    const content = await generateQuoteAndAuthor(type)

    return NextResponse.json(content)
  } catch (error) {
    console.error('Text generation error:', error)
    
    if (error instanceof Error && error.message.includes('CLAUDE_API_KEY')) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
