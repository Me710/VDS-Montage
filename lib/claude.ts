import Anthropic from '@anthropic-ai/sdk'

let claudeClient: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!claudeClient) {
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not configured')
    }
    claudeClient = new Anthropic({ apiKey })
  }
  return claudeClient
}

export type ContentType = 'jour' | 'saint'

export interface GeneratedContent {
  quote: string
  author: string
}

export async function generateQuoteAndAuthor(type: ContentType): Promise<GeneratedContent> {
  const client = getClaudeClient()
  
  const systemPrompt = type === 'jour' 
    ? `Tu es un créateur de citations inspirantes pour des publications "Pensée du Jour". 
       Génère une citation originale et profonde sur la vie, le bonheur, la persévérance, ou la sagesse.
       La citation doit être en français, inspirante et entre 100-200 caractères.
       Invente également un auteur crédible (philosophe, écrivain, ou penseur fictif mais réaliste).`
    : `Tu es un créateur de citations spirituelles pour des publications "Pensée de Saint".
       Génère une citation inspirante sur la foi, l'espérance, l'amour divin, ou la sagesse spirituelle.
       La citation doit être en français, édifiante et entre 100-200 caractères.
       Attribue cette citation à un saint catholique réel ou à une figure spirituelle connue.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      { 
        role: 'user', 
        content: 'Génère une nouvelle citation avec son auteur. Réponds UNIQUEMENT au format JSON: {"quote": "...", "author": "..."}'
      }
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }
  
  const text = content.text
  
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent
    return {
      quote: parsed.quote || 'La sagesse commence dans l\'émerveillement.',
      author: parsed.author || 'Anonyme',
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', error)
    // Return a fallback
    return {
      quote: type === 'jour' 
        ? 'Chaque jour est une nouvelle chance de devenir qui vous voulez être.'
        : 'La foi est la lumière qui guide nos pas dans l\'obscurité.',
      author: type === 'jour' ? 'Sagesse Universelle' : 'Saint Augustin',
    }
  }
}
