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

export type ContentType = 'jour' | 'saint' | 'ciel' | 'evangile'

export interface GeneratedContent {
  quote: string
  author: string
  title?: string
}

function getSystemPrompt(type: ContentType): string {
  switch (type) {
    case 'jour':
      return `Tu es un créateur de citations inspirantes pour des publications "Pensée du Jour". 
       Génère une citation originale et profonde sur la vie, le bonheur, la persévérance, ou la sagesse.
       La citation doit être en français, inspirante et entre 100-200 caractères.
       Invente également un auteur crédible (philosophe, écrivain, ou penseur fictif mais réaliste).`
    case 'saint':
      return `Tu es un créateur de citations spirituelles pour des publications "Pensée de Saint".
       Génère une citation inspirante sur la foi, l'espérance, l'amour divin, ou la sagesse spirituelle.
       La citation doit être en français, édifiante et entre 100-200 caractères.
       Attribue cette citation à un saint catholique réel ou à une figure spirituelle connue.`
    case 'ciel':
      return `Tu es un expert en foi catholique pour des publications "Un Regard au Ciel".
       
       IMPORTANT: Varie les sujets! Ne choisis PAS toujours les mêmes saints (évite de répéter François d'Assise, Thérèse de Lisieux).
       
       Choisis UN sujet ALÉATOIRE parmi cette liste variée:
       - Saints: Jean-Paul II, Padre Pio, Mère Teresa, Augustin, Thomas d'Aquin, Jeanne d'Arc, Vincent de Paul, Jean-Marie Vianney, Faustine Kowalska, Maximilien Kolbe, Rita de Cascia, Antoine de Padoue, Bernadette Soubirous
       - Scènes bibliques: La Cène, La Résurrection, La Nativité, L'Annonciation, Le Bon Samaritain, Les Béatitudes, La Transfiguration
       - Lieux sacrés: Cathédrale Notre-Dame, Basilique Saint-Pierre, Lourdes, Fatima, Sacré-Cœur de Montmartre
       - Autres: Le Sacré-Cœur de Jésus, Saint Michel Archange, Les Anges Gardiens
       
       Génère:
       1. Un titre approprié
       2. Une citation authentique de ce saint OU un verset biblique pertinent
       3. La source exacte (nom du saint ou référence biblique comme "Jean 14:6")
       
       Sois créatif et varie tes choix à chaque génération!`
    case 'evangile':
      return `Tu es un expert en Évangiles pour des publications "L'Évangile Illustré".
       
       Choisis UN passage d'Évangile parmi les plus beaux et les plus connus:
       - Les Béatitudes (Matthieu 5:3-12)
       - Le Bon Berger (Jean 10:1-18)
       - Le Bon Samaritain (Luc 10:25-37)
       - Le Fils Prodigue (Luc 15:11-32)
       - La multiplication des pains (Jean 6:1-15)
       - Jésus marche sur l'eau (Matthieu 14:22-33)
       - La tempête apaisée (Marc 4:35-41)
       - Les noces de Cana (Jean 2:1-11)
       - La résurrection de Lazare (Jean 11:1-44)
       - Le sermon sur la montagne (Matthieu 5-7)
       - La parabole du semeur (Matthieu 13:1-23)
       - La pêche miraculeuse (Luc 5:1-11)
       - Jésus et les enfants (Marc 10:13-16)
       
       Génère:
       1. Un titre court et évocateur pour la scène
       2. Un verset clé de ce passage (en français, fidèle au texte biblique)
       3. La référence biblique exacte (ex: "Jean 10:11")
       
       Le verset doit être percutant et représentatif du passage.`
  }
}

function getFallbackContent(type: ContentType): GeneratedContent {
  switch (type) {
    case 'jour':
      return {
        quote: 'Chaque jour est une nouvelle chance de devenir qui vous voulez être.',
        author: 'Sagesse Universelle',
      }
    case 'saint':
      return {
        quote: 'La foi est la lumière qui guide nos pas dans l\'obscurité.',
        author: 'Saint Augustin',
      }
    case 'ciel':
      return {
        quote: 'Je suis le chemin, la vérité et la vie.',
        author: 'Jean 14:6',
        title: 'Parole du Christ',
      }
    case 'evangile':
      return {
        quote: 'Je suis le bon berger. Le bon berger donne sa vie pour ses brebis.',
        author: 'Jean 10:11',
        title: 'Le Bon Berger',
      }
  }
}

export async function generateQuoteAndAuthor(type: ContentType): Promise<GeneratedContent> {
  const client = getClaudeClient()
  
  const systemPrompt = getSystemPrompt(type)
  
  let userPrompt: string
  if (type === 'ciel') {
    userPrompt = 'Choisis un sujet et génère le contenu. Réponds UNIQUEMENT au format JSON: {"title": "Titre du sujet", "quote": "Citation ou verset", "author": "Source"}'
  } else if (type === 'evangile') {
    userPrompt = 'Choisis un passage d\'Évangile et génère le contenu. Réponds UNIQUEMENT au format JSON: {"title": "Titre de la scène", "quote": "Verset clé en français", "author": "Référence biblique (ex: Jean 10:11)"}'
  } else {
    userPrompt = 'Génère une nouvelle citation avec son auteur. Réponds UNIQUEMENT au format JSON: {"quote": "...", "author": "..."}'
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      { 
        role: 'user', 
        content: userPrompt
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
    
    if (type === 'ciel' || type === 'evangile') {
      return {
        quote: parsed.quote || 'Tout est grâce.',
        author: parsed.author || parsed.title || 'Saint',
        title: parsed.title || parsed.author || 'Saint',
      }
    }
    
    return {
      quote: parsed.quote || 'La sagesse commence dans l\'émerveillement.',
      author: parsed.author || 'Anonyme',
    }
  } catch (error) {
    console.error('Failed to parse Claude response:', error)
    return getFallbackContent(type)
  }
}
