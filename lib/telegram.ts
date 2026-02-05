const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendImageToTelegram(
  imageBase64: string,
  caption: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping backup')
    return false
  }

  try {
    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Create form data
    const formData = new FormData()
    const blob = new Blob([buffer], { type: 'image/png' })
    formData.append('chat_id', TELEGRAM_CHAT_ID)
    formData.append('photo', blob, 'vds-montage.png')
    formData.append('caption', caption)

    // Send to Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Telegram API error:', error)
      return false
    }

    console.log('Image sent to Telegram successfully')
    return true
  } catch (error) {
    console.error('Failed to send image to Telegram:', error)
    return false
  }
}
