import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be PNG, JPEG, WebP, or GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      )
    }

    // Delete existing logos first (to avoid accumulating files)
    try {
      const existingBlobs = await list({ prefix: 'vds-logo-' })
      for (const blob of existingBlobs.blobs) {
        await del(blob.url)
      }
    } catch (e) {
      // Ignore errors when deleting old logos
      console.log('Could not delete old logos:', e)
    }

    // Upload new logo
    const timestamp = Date.now()
    const blob = await put(`vds-logo-${timestamp}.${file.type.split('/')[1]}`, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Logo upload error:', error)
    
    if (error instanceof Error && error.message.includes('BLOB_READ_WRITE_TOKEN')) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Delete all custom logos
    const existingBlobs = await list({ prefix: 'vds-logo-' })
    for (const blob of existingBlobs.blobs) {
      await del(blob.url)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logo deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    )
  }
}
