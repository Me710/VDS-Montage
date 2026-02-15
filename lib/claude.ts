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

// Helper to pick one random item from an array
function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Helper to pick N random items from an array (Fisher-Yates shuffle)
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(n, copy.length))
}

// Blacklist of overused citations to explicitly ban
const BANNED_QUOTES = [
  'Je suis le chemin, la vérité et la vie',
  'Aimez-vous les uns les autres',
  'La foi soulève les montagnes',
  'Tout est grâce',
  'Priez sans cesse',
  'La prière est la respiration de l\'âme',
  'Dieu est amour',
  'Aime et fais ce que tu veux',
  'La mesure de l\'amour c\'est d\'aimer sans mesure',
  'Là où il y a la haine, que je mette l\'amour',
  'Rien n\'est impossible à Dieu',
  'Chaque jour est une nouvelle chance',
  'Le bonheur est un choix',
]

function getSystemPrompt(type: ContentType): string {
  // Generate unique random identifier for this request
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
  
  switch (type) {
    case 'jour': {
      const jourThemes = [
        'le courage face à l\'adversité', 'la beauté de l\'instant présent', 'la force intérieure',
        'le pardon et la réconciliation', 'la gratitude quotidienne', 'l\'humilité et la grandeur',
        'la patience comme vertu', 'l\'amour inconditionnel', 'la simplicité de vivre',
        'la résilience de l\'âme', 'la lumière dans l\'obscurité', 'le silence et la paix intérieure',
        'la joie des petites choses', 'la sagesse de l\'expérience', 'le don de soi',
        'l\'espérance face au doute', 'la liberté intérieure', 'la compassion envers autrui',
        'le chemin de la vérité', 'l\'émerveillement devant la création',
        'le temps qui passe et la plénitude', 'la douceur de la solitude choisie',
        'le renouveau après l\'épreuve', 'l\'art de lâcher prise', 'la fidélité à soi-même',
        'la beauté cachée dans l\'ordinaire', 'l\'accueil de l\'inconnu', 'la tendresse comme force',
      ]
      const chosenTheme = pickOne(jourThemes)
      
      const jourStyles = [
        'une métaphore poétique avec la nature',
        'un ton philosophique profond',
        'une image évocatrice et visuelle',
        'un paradoxe surprenant',
        'une observation simple mais profonde',
        'un style contemplatif et apaisant',
        'un ton encourageant et combatif',
      ]
      const chosenStyle = pickOne(jourStyles)
      
      return `Tu es un créateur de citations inspirantes pour "Pensée du Jour". ID requête: ${requestId}
       
       THÈME: "${chosenTheme}"
       STYLE: ${chosenStyle}
       
       Génère UNE citation ORIGINALE et profonde. La citation doit:
       - Être en français, entre 80-180 caractères
       - Utiliser ${chosenStyle}
       - Être UNIQUE, POÉTIQUE et SURPRENANTE
       - NE JAMAIS reprendre des citations déjà connues
       
       Invente un auteur crédible (philosophe, écrivain fictif mais réaliste, penseur original).
       
       CITATIONS INTERDITES (ne JAMAIS utiliser ni paraphraser):
       ${BANNED_QUOTES.slice(0, 5).map(q => `- "${q}"`).join('\n       ')}`
    }
    case 'saint': {
      // 40 saints diversifiés
      const allSaints = [
        'Saint Augustin', 'Saint Thomas d\'Aquin', 'Sainte Thérèse d\'Avila', 'Saint Jean de la Croix',
        'Saint François de Sales', 'Saint Padre Pio', 'Sainte Catherine de Sienne', 'Saint Benoît',
        'Sainte Hildegarde de Bingen', 'Saint Irénée de Lyon', 'Saint Cyprien de Carthage',
        'Saint Basile le Grand', 'Saint Grégoire de Nazianze', 'Saint Jean Chrysostome',
        'Sainte Faustine Kowalska', 'Saint Maximilien Kolbe', 'Saint Louis-Marie Grignion de Montfort',
        'Sainte Élisabeth de la Trinité', 'Saint Alphonse de Liguori', 'Sainte Edith Stein',
        'Saint Jean-Paul II', 'Mère Teresa de Calcutta', 'Saint Vincent de Paul',
        'Saint Jean-Marie Vianney', 'Sainte Bernadette Soubirous', 'Saint Antoine de Padoue',
        'Sainte Rita de Cascia', 'Saint Ignace de Loyola', 'Saint Philippe Néri',
        'Sainte Jeanne d\'Arc', 'Saint François d\'Assise', 'Sainte Claire d\'Assise',
        'Saint Dominique', 'Saint Bernard de Clairvaux', 'Sainte Thérèse de Lisieux',
        'Saint Léon le Grand', 'Sainte Brigitte de Suède', 'Saint Charles Borromée',
        'Saint Robert Bellarmin', 'Sainte Marguerite-Marie Alacoque',
        'Saint Ambroise de Milan', 'Saint Grégoire le Grand', 'Sainte Gertrude d\'Helfta',
        'Saint Anselme de Cantorbéry', 'Sainte Monique', 'Saint Josémaria Escriva',
        'Saint Pie de Pietrelcina', 'Sainte Marthe', 'Saint Polycarpe de Smyrne',
      ]
      const chosenSaint = pickOne(allSaints)
      
      const saintTopics = [
        'la foi vivante', 'l\'espérance dans l\'épreuve', 'la charité fraternelle',
        'l\'amour de Dieu', 'la prière contemplative', 'l\'humilité du cœur',
        'la confiance totale en Dieu', 'la joie spirituelle', 'le sacrifice par amour',
        'la miséricorde divine', 'la grâce qui transforme', 'l\'abandon confiant à Dieu',
        'la sagesse du silence', 'la vie intérieure profonde', 'la paix du cœur en Dieu',
        'la conversion du regard', 'l\'unité avec le Christ', 'la fécondité de la souffrance',
        'la beauté de la sainteté', 'le détachement des biens terrestres',
      ]
      const chosenTopic = pickOne(saintTopics)

      return `Tu es un spécialiste des écrits des saints catholiques. ID requête: ${requestId}
       
       SAINT IMPOSÉ (tu DOIS utiliser ce saint) : ${chosenSaint}
       THÈME IMPOSÉ : ${chosenTopic}
       
       Trouve une VRAIE citation de ${chosenSaint} sur "${chosenTopic}".
       Si tu ne connais pas de citation exacte de ce saint sur ce thème, compose une citation
       profondément fidèle au style d'écriture et à la spiritualité propre de ${chosenSaint}.
       
       La citation doit être en français, édifiante, entre 80-180 caractères.
       
       L'auteur DOIT être "${chosenSaint}" (pas un autre saint).
       
       CITATIONS ABSOLUMENT INTERDITES (ne JAMAIS utiliser même sous forme reformulée):
       ${BANNED_QUOTES.map(q => `- "${q}"`).join('\n       ')}
       
       Trouve quelque chose de RARE, PROFOND et SPÉCIFIQUE à ce saint.`
    }
    case 'ciel': {
      const cielSubjects = [
        // Saints
        'Saint Jean-Paul II', 'Padre Pio', 'Mère Teresa', 'Saint Augustin', 'Saint Thomas d\'Aquin',
        'Sainte Jeanne d\'Arc', 'Saint Vincent de Paul', 'Saint Jean-Marie Vianney',
        'Sainte Faustine Kowalska', 'Saint Maximilien Kolbe', 'Sainte Rita de Cascia',
        'Saint Antoine de Padoue', 'Sainte Bernadette Soubirous', 'Saint François de Sales',
        'Sainte Catherine de Sienne', 'Saint Benoît', 'Saint Ignace de Loyola',
        'Sainte Hildegarde de Bingen', 'Saint Philippe Néri', 'Sainte Claire d\'Assise',
        'Sainte Thérèse d\'Avila', 'Saint Jean de la Croix', 'Sainte Edith Stein',
        'Saint Dominique', 'Saint Bernard de Clairvaux', 'Sainte Élisabeth de Hongrie',
        'Saint Charles Borromée', 'Sainte Marguerite-Marie Alacoque',
        // Scènes bibliques
        'La Cène', 'La Résurrection du Christ', 'La Nativité', 'L\'Annonciation',
        'Le Bon Samaritain', 'Les Béatitudes', 'La Transfiguration', 'Le Baptême de Jésus',
        'L\'Ascension', 'La Pentecôte', 'La Visitation', 'La Présentation au Temple',
        'Le Chemin de Croix', 'La Cène d\'Emmaüs', 'L\'Agonie au Jardin des Oliviers',
        // Lieux sacrés
        'Cathédrale Notre-Dame de Paris', 'Basilique Saint-Pierre de Rome', 'Lourdes',
        'Fatima', 'Sacré-Cœur de Montmartre', 'Saint-Jacques-de-Compostelle',
        'Mont Saint-Michel', 'Assise',
        // Autres sujets
        'Le Sacré-Cœur de Jésus', 'Saint Michel Archange', 'Les Anges Gardiens',
        'La Vierge Marie Immaculée', 'Le Saint-Esprit', 'La Sainte Trinité',
        'Le Rosaire', 'L\'Eucharistie', 'La Divine Miséricorde',
      ]
      // Pick exactly ONE subject
      const chosenSubject = pickOne(cielSubjects)
      
      // Pick from different Bible books for variety
      const bibleBooks = pickRandom([
        'Psaumes', 'Proverbes', 'Isaïe', 'Jérémie', 'Sagesse', 'Siracide',
        'Matthieu', 'Marc', 'Luc', 'Jean', 'Romains', 'Corinthiens',
        'Éphésiens', 'Philippiens', 'Colossiens', 'Jacques', 'Pierre',
        'Apocalypse', 'Cantique des Cantiques', 'Deutéronome',
      ], 3)
      
      return `Tu es un expert en foi catholique pour "Un Regard au Ciel". ID requête: ${requestId}
       
       SUJET IMPOSÉ (obligatoire, tu ne peux PAS en choisir un autre) : ${chosenSubject}
       
       Génère:
       1. Un titre approprié à "${chosenSubject}"
       2. Une citation AUTHENTIQUE et PEU CONNUE (si c'est un saint, une vraie citation ; si c'est une scène biblique, un verset EXACT)
       3. La source exacte
       
       Si tu cherches un verset biblique, privilégie les livres suivants : ${bibleBooks.join(', ')}
       
       CITATIONS ABSOLUMENT INTERDITES:
       ${BANNED_QUOTES.map(q => `- "${q}"`).join('\n       ')}
       
       Le verset/citation doit être RARE, PROFOND et SPÉCIFIQUE au sujet imposé.
       Sois PRÉCIS dans la référence (chapitre ET verset, ex: "Psaume 63:2").`
    }
    case 'evangile': {
      const allPassages = [
        'Les Béatitudes (Matthieu 5:3-12)', 'Le Notre Père (Matthieu 6:9-13)',
        'Ne vous inquiétez pas (Matthieu 6:25-34)', 'La parabole du semeur (Matthieu 13:1-23)',
        'Jésus marche sur l\'eau (Matthieu 14:22-33)', 'La Transfiguration (Matthieu 17:1-8)',
        'Les deux grands commandements (Matthieu 22:34-40)', 'La parabole des talents (Matthieu 25:14-30)',
        'Le jugement dernier (Matthieu 25:31-46)', 'La parabole du trésor caché (Matthieu 13:44-46)',
        'Le serviteur impitoyable (Matthieu 18:21-35)', 'Les ouvriers de la dernière heure (Matthieu 20:1-16)',
        'La tempête apaisée (Marc 4:35-41)', 'La guérison de l\'aveugle Bartimée (Marc 10:46-52)',
        'Jésus et les enfants (Marc 10:13-16)', 'L\'obole de la veuve (Marc 12:41-44)',
        'La guérison du paralytique (Marc 2:1-12)', 'Le jeune homme riche (Marc 10:17-27)',
        'Le Bon Samaritain (Luc 10:25-37)', 'Le Fils Prodigue (Luc 15:11-32)',
        'La pêche miraculeuse (Luc 5:1-11)', 'Le Magnificat de Marie (Luc 1:46-55)',
        'Les pèlerins d\'Emmaüs (Luc 24:13-35)', 'Zachée le publicain (Luc 19:1-10)',
        'La brebis perdue (Luc 15:1-7)', 'La drachme perdue (Luc 15:8-10)',
        'Le pharisien et le publicain (Luc 18:9-14)', 'Marthe et Marie (Luc 10:38-42)',
        'L\'Annonciation (Luc 1:26-38)', 'La Nativité (Luc 2:1-20)',
        'Le bon larron (Luc 23:39-43)', 'Le Bon Berger (Jean 10:1-18)',
        'La multiplication des pains (Jean 6:1-15)', 'Les noces de Cana (Jean 2:1-11)',
        'La résurrection de Lazare (Jean 11:1-44)', 'La Samaritaine (Jean 4:1-42)',
        'Le lavement des pieds (Jean 13:1-17)', 'Je suis la vigne (Jean 15:1-8)',
        'La guérison de l\'aveugle-né (Jean 9:1-41)', 'Le pain de vie (Jean 6:22-59)',
        'Thomas l\'incrédule (Jean 20:24-29)', 'La pêche miraculeuse après la Résurrection (Jean 21:1-14)',
        'Nicodème et la nouvelle naissance (Jean 3:1-21)',
      ]
      const chosenPassage = pickOne(allPassages)
      
      // Pick which specific verse angle to focus on
      const verseAngles = [
        'le verset le plus ÉMOUVANT du passage',
        'le verset le plus SURPRENANT ou INATTENDU du passage',
        'le verset qui contient la PAROLE DIRECTE de Jésus dans ce passage',
        'le verset qui exprime le mieux le MESSAGE CENTRAL du passage',
        'un verset MÉCONNU mais profond de ce passage (pas le plus célèbre)',
      ]
      const chosenAngle = pickOne(verseAngles)
      
      return `Tu es un bibliste expert pour "L'Évangile Illustré". ID requête: ${requestId}
       
       PASSAGE IMPOSÉ (obligatoire) : ${chosenPassage}
       ANGLE : Trouve ${chosenAngle}
       
       Génère:
       1. Un titre court et évocateur (4-6 mots maximum)
       2. Le verset EXACT en français (traduction liturgique officielle)
       3. La référence biblique PRÉCISE (ex: "Luc 15:20" - un seul verset, pas une plage)
       
       CITATIONS INTERDITES:
       ${BANNED_QUOTES.slice(0, 5).map(q => `- "${q}"`).join('\n       ')}
       
       IMPORTANT: Cite le TEXTE BIBLIQUE EXACT, pas une paraphrase.`
    }
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
  
  // Build a unique user prompt with random number to bust any response caching
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  let userPrompt: string
  
  if (type === 'ciel') {
    userPrompt = `[REQ-${uniqueId}] Génère le contenu pour le sujet IMPOSÉ ci-dessus (pas un autre). Réponds UNIQUEMENT en JSON: {"title": "Titre", "quote": "Citation/verset RARE", "author": "Source précise"}`
  } else if (type === 'evangile') {
    userPrompt = `[REQ-${uniqueId}] Génère le contenu pour le passage IMPOSÉ ci-dessus. Trouve le verset avec l'angle demandé. Réponds UNIQUEMENT en JSON: {"title": "Titre court", "quote": "Verset EXACT en français", "author": "Référence précise (ex: Luc 15:20)"}`
  } else {
    userPrompt = `[REQ-${uniqueId}] Génère le contenu selon les contraintes ci-dessus (saint et thème imposés). Réponds UNIQUEMENT en JSON: {"quote": "Citation", "author": "Auteur"}`
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    temperature: 1.0,  // Maximum temperature for maximum variation
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
