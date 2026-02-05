import { GoogleGenAI } from '@google/genai'

export type ContentType = 'jour' | 'saint'

// Generate image using Google Gemini with native image generation
export async function generateImageWithGemini(type: ContentType, style: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const prompt = type === 'jour'
    ? `Create a photorealistic beautiful serene ${style} landscape photograph for an inspirational quote background. Natural scenery with soft golden hour lighting. Mountains, ocean, forest, or meadow. High quality, peaceful atmosphere. Professional photography, cinematic lighting. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`
    : `Create a photorealistic beautiful sacred ${style} scene for a spiritual quote background. Church interior with divine light rays, cathedral architecture, or heavenly clouds. High quality, spiritual atmosphere. Professional photography, ethereal lighting. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp-image-generation',
    contents: prompt,
    config: {
      responseModalities: ['Text', 'Image'],
    },
  })

  // Look for image in response
  const candidates = response.candidates
  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content?.parts || []
    for (const part of parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || 'image/png'
        const imageData = part.inlineData.data
        return `data:${mimeType};base64,${imageData}`
      }
    }
  }

  throw new Error('No image generated - please check your Gemini API key')
}
