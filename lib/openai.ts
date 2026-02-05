import OpenAI from 'openai'

// OpenAI client - only create on server side
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export type ContentType = 'jour' | 'saint'

export interface GeneratedContent {
  quote: string
  author: string
}

export async function generateQuoteAndAuthor(type: ContentType): Promise<GeneratedContent> {
  const client = getOpenAIClient()
  
  const systemPrompt = type === 'jour' 
    ? `Tu es un créateur de citations inspirantes pour des publications "Pensée du Jour". 
       Génère une citation originale et profonde sur la vie, le bonheur, la persévérance, ou la sagesse.
       La citation doit être en français, inspirante et entre 100-200 caractères.
       Invente également un auteur crédible (philosophe, écrivain, ou penseur fictif mais réaliste).`
    : `Tu es un créateur de citations spirituelles pour des publications "Pensée de Saint".
       Génère une citation inspirante sur la foi, l'espérance, l'amour divin, ou la sagesse spirituelle.
       La citation doit être en français, édifiante et entre 100-200 caractères.
       Attribue cette citation à un saint catholique réel ou à un figure spirituelle connue.`

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: 'Génère une nouvelle citation avec son auteur. Réponds UNIQUEMENT au format JSON: {"quote": "...", "author": "..."}'
      }
    ],
    temperature: 0.9,
    max_tokens: 300,
  })

  const content = response.choices[0]?.message?.content || ''
  
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent
    return {
      quote: parsed.quote || 'La sagesse commence dans l\'émerveillement.',
      author: parsed.author || 'Anonyme',
    }
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error)
    // Return a fallback
    return {
      quote: type === 'jour' 
        ? 'Chaque jour est une nouvelle chance de devenir qui vous voulez être.'
        : 'La foi est la lumière qui guide nos pas dans l\'obscurité.',
      author: type === 'jour' ? 'Sagesse Universelle' : 'Saint Augustin',
    }
  }
}

export async function generateBackgroundImage(type: ContentType, style: string): Promise<string> {
  const client = getOpenAIClient()
  
  const prompt = type === 'jour'
    ? `A beautiful, serene ${style} landscape photograph for an inspirational quote. 
       Natural scenery with soft golden hour lighting. Mountains, ocean, forest, or meadow.
       High quality, peaceful atmosphere, perfect for text overlay.
       Style: professional photography, cinematic, 4K quality.`
    : `A beautiful, sacred ${style} scene for a spiritual quote.
       Church interior with divine light rays, cathedral architecture, or heavenly clouds.
       High quality, spiritual atmosphere, perfect for text overlay.
       Style: professional photography, ethereal lighting, 4K quality.`

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })

  const imageUrl = response.data?.[0]?.url
  if (!imageUrl) {
    throw new Error('No image generated')
  }

  return imageUrl
}
