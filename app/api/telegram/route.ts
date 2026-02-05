import { NextRequest, NextResponse } from 'next/server'
import { sendImageToTelegram } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, caption } = body

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    const success = await sendImageToTelegram(
      image,
      caption || '📸 VDS Montage - Nouvelle création'
    )

    return NextResponse.json({ success })
  } catch (error) {
    console.error('Telegram send error:', error)
    return NextResponse.json(
      { error: 'Failed to send to Telegram' },
      { status: 500 }
    )
  }
}
