import { GoogleGenAI } from '@google/genai'

export type ContentType = 'jour' | 'saint' | 'ciel' | 'evangile'

function getImagePrompt(type: ContentType, style: string): string {
  switch (type) {
    case 'jour':
      return `Create a photorealistic beautiful serene ${style} landscape photograph for an inspirational quote background. Natural scenery with soft golden hour lighting. Mountains, ocean, forest, or meadow. High quality, peaceful atmosphere. Professional photography, cinematic lighting. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`
    case 'saint':
      return `Create a photorealistic beautiful sacred ${style} scene for a spiritual quote background. Church interior with divine light rays, cathedral architecture, or heavenly clouds. High quality, spiritual atmosphere. Professional photography, ethereal lighting. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`
    case 'ciel':
      // Randomly select a subject to avoid bias - with accurate Catholic iconography
      const subjects = [
        // Saints with accurate traditional attributes
        'Saint John Paul II, elderly pope with white cassock and zucchetto, kind pastoral expression, simple background',
        'Saint Padre Pio, elderly Capuchin friar with brown Franciscan habit, white beard, contemplative expression',
        'Saint Therese of Lisieux, young Carmelite nun in brown and white habit with black veil, holding a crucifix and roses',
        'Saint Francis of Assisi in simple brown Franciscan robe with rope belt, surrounded by birds in nature',
        'Saint Joan of Arc, young woman in medieval armor holding a white banner with fleur-de-lis',
        'Saint Augustine of Hippo in black Augustinian habit with bishop mitre, holding a book and quill',
        'Saint Thomas Aquinas in white Dominican habit with black cape, holding the Summa Theologica book',
        'Saint Anthony of Padua in brown Franciscan habit holding the Child Jesus and a lily',
        'Saint Michael the Archangel in golden armor with sword and shield, defeating a demon beneath his feet',
        
        // Biblical scenes - traditional accurate representations
        'the Nativity scene: Baby Jesus in manger with hay, Virgin Mary in blue mantle, Saint Joseph in brown, ox and donkey, humble stable',
        'the Resurrection: Christ risen in white robes with wounds visible, emerging from stone tomb, Roman soldiers fallen, dawn light',
        'the Crucifixion: Jesus on wooden cross with INRI sign, crown of thorns, Virgin Mary and Saint John at foot of cross',
        
        // Sacred imagery - accurate Catholic symbolism
        'the Sacred Heart of Jesus: Jesus showing his heart surrounded by crown of thorns and flames, one hand blessing',
        'a golden monstrance with the Eucharistic host displayed in the center, rays of light emanating, on altar with candles',
        'a traditional Catholic church interior: high altar with tabernacle, sanctuary lamp lit in red, wooden pews, stained glass',
        'a Gothic cathedral rose window with intricate geometric patterns and biblical figures in colored glass, light streaming through',
        'a peaceful Benedictine monastery cloister with stone arches, garden courtyard, monks in black habits walking'
      ]
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
      return `Create an accurate Catholic religious image: ${randomSubject}. IMPORTANT: Be faithful to traditional Catholic iconography and symbolism. Do not invent or modify traditional attributes. Style: classical Renaissance or Baroque devotional art, warm golden divine lighting, reverent sacred atmosphere. High quality painting style. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`
    case 'evangile':
      // Cinematic biblical style - faceless stylized figures
      const evangelScenes = [
        // The Good Shepherd - Psalm 23 / John 10
        'A serene biblical shepherd scene at golden hour, faceless stylized human figure with smooth marble-like skin, wearing ancient Middle Eastern shepherd clothing (simple brown robe, white head covering), holding a wooden staff, guiding a small flock of sheep across a sun-lit Mediterranean landscape with rolling hills, olive trees, warm earth tones',
        
        // The Beatitudes - Sermon on the Mount
        'A faceless stylized figure in white robes standing on a hillside, teaching to a gathered crowd below, Mediterranean landscape, olive trees, golden hour light streaming through clouds, peaceful sacred atmosphere',
        
        // The Good Samaritan
        'A faceless stylized figure in ancient robes kneeling beside another figure lying on a dusty road, helping him, donkey nearby, ancient Middle Eastern landscape, warm golden lighting, compassionate scene',
        
        // The Prodigal Son - Return
        'A faceless stylized figure in tattered robes being embraced by another figure in fine robes, ancient Middle Eastern house entrance, warm welcoming light, emotional reunion scene',
        
        // Multiplication of loaves
        'A faceless stylized figure in white robes holding bread and fish, crowd of faceless figures seated on grassy hillside, baskets of bread, Sea of Galilee in background, golden hour',
        
        // Walking on water
        'A faceless stylized figure in white robes walking on calm water, boat with faceless figures in background, dawn light reflecting on water surface, peaceful yet miraculous atmosphere',
        
        // Calming the storm
        'A faceless stylized figure standing in a wooden boat with arms raised, stormy sea becoming calm, other faceless figures watching in awe, dramatic lighting breaking through clouds',
        
        // The Sower
        'A faceless stylized figure in simple robes scattering seeds across a field, different types of soil visible, birds in sky, Mediterranean landscape, morning golden light',
        
        // Fishers of men
        'Faceless stylized figures pulling fishing nets from a wooden boat on calm lake, abundant catch of fish, sunrise over Sea of Galilee, nets overflowing',
        
        // Jesus and the children
        'A faceless stylized figure in white robes surrounded by small faceless children figures, blessing them, garden setting, warm gentle light, tender peaceful scene'
      ]
      const randomEvangelScene = evangelScenes[Math.floor(Math.random() * evangelScenes.length)]
      return `${randomEvangelScene}. Cinematic lighting, soft volumetric sun rays, gentle dust particles floating in the air, shallow depth of field. The mood is peaceful, sacred, timeless, and contemplative, evoking biblical symbolism, humility, guidance, and divine calm. Ultra-high quality, cinematic composition, modern 3D realism with symbolic minimalism, no facial features, physically based rendering, global illumination, soft shadows. Color palette: warm golds, soft greens, beige, earthy browns, natural light. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks, no logos.`
  }
}

// Generate image using Google Gemini with native image generation
export async function generateImageWithGemini(type: ContentType, style: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const prompt = getImagePrompt(type, style)

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
