import { GoogleGenAI } from '@google/genai'

export type ContentType = 'jour' | 'saint' | 'ciel' | 'evangile'

function getImagePrompt(type: ContentType, style: string, evangelContext?: string): string {
  switch (type) {
    case 'jour':
      return `Create a photorealistic beautiful serene ${style} landscape photograph for an inspirational quote background. Natural scenery with soft golden hour lighting. Mountains, ocean, forest, or meadow. High quality, peaceful atmosphere. Professional photography, cinematic lighting. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`
    case 'saint':
      // Randomly select diverse sacred imagery - NOT just churches
      const saintSubjects = [
        // Sacred symbols and objects
        `a beautiful golden crucifix bathed in warm divine light, with bokeh light effects, spiritual atmosphere`,
        `hands clasped in prayer with soft golden light streaming through, serene devotional moment`,
        `an open ancient Bible with golden light illuminating the pages, candles nearby, sacred study`,
        `a rosary draped over an ancient stone surface with soft candlelight, contemplative atmosphere`,
        `lit prayer candles in a dark sacred space, warm golden glow, peaceful devotion`,
        `a beautiful stained glass window depicting a saint, colorful light streaming through`,
        `a dove in flight against golden sunrise clouds, symbol of the Holy Spirit`,
        `a sacred chalice and bread on an altar with divine golden light, Eucharistic symbolism`,
        // Nature and divine light
        `a single beam of divine light breaking through dramatic clouds over a peaceful landscape`,
        `a narrow path through a misty ancient forest with rays of light filtering through, spiritual journey`,
        `a sunrise over calm waters with golden reflections, new beginning and hope`,
        `a solitary olive tree in golden hour light, symbol of peace and endurance`,
        // Sacred art style
        `a sacred heart with golden flames and crown of thorns, baroque painting style, divine love`,
        `angel wings in golden light, ethereal and majestic, Renaissance art inspiration`,
        `an ancient monastery garden at golden hour with blooming flowers and stone paths`,
      ]
      const randomSaintSubject = saintSubjects[Math.floor(Math.random() * saintSubjects.length)]
      return `Create a photorealistic beautiful ${style} image: ${randomSaintSubject}. High quality, spiritual atmosphere. Professional photography, ethereal lighting. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks.`
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
    case 'evangile': {
      const evangelCinematicStyle = `Cinematic lighting, soft volumetric sun rays, gentle dust particles floating in the air, shallow depth of field. The mood is peaceful, sacred, timeless, and contemplative, evoking biblical symbolism, humility, guidance, and divine calm. Ultra-high quality, cinematic composition, modern 3D realism with symbolic minimalism, no facial features, physically based rendering, global illumination, soft shadows. Color palette: warm golds, soft greens, beige, earthy browns, natural light. Square format 1:1 aspect ratio. No text, no words, no letters, no watermarks, no logos.`

      // Si un contexte est fourni (titre de l'évangile du jour), générer une scène pertinente
      if (evangelContext && evangelContext.trim().length > 0) {
        return `Cinematic biblical scene visually inspired by the Gospel passage titled: "${evangelContext}". Depict the key moment or setting of this passage with faceless stylized human figures with smooth marble-like skin, wearing ancient Middle Eastern clothing (simple robes, tunics, head coverings). Ancient Palestinian landscape — stone paths, olive trees, hills of Galilee, or shores of the Sea of Galilee as appropriate. ${evangelCinematicStyle}`
      }

      // Sinon, scène aléatoire
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
        'A faceless stylized figure in white robes surrounded by small faceless children figures, blessing them, garden setting, warm gentle light, tender peaceful scene',
        
        // Wedding at Cana
        'Ancient stone water jars at a festive Middle Eastern wedding celebration, faceless figures in joyful gathering, warm lantern light, abundance of food and wine, celebration atmosphere',
        
        // Raising of Lazarus
        'A faceless figure in white robes standing before a cave tomb entrance, other faceless figures watching in astonishment, dramatic light emerging from the dark cave, dawn breaking',
        
        // The Last Supper
        'A long wooden table with bread and wine goblets in an upper room, warm candlelight, 13 faceless figures gathered for a sacred meal, ancient Middle Eastern setting, intimate atmosphere',
        
        // Garden of Gethsemane
        'A solitary faceless figure kneeling in prayer under ancient olive trees at night, moonlight filtering through gnarled branches, lanterns in the distance, emotional solitude',
        
        // The Transfiguration
        'A faceless figure in radiant white robes on a mountain summit, surrounded by brilliant divine light, two other faceless figures beside, three faceless figures watching below in awe, clouds parting',
        
        // The Woman at the Well
        'A faceless figure in white robes sitting by an ancient stone well, speaking with another faceless figure carrying a water jar, Samaritan landscape, midday sun, peaceful dialogue',
        
        // Zacchaeus in the tree
        'A small faceless figure perched in a large sycamore tree, looking down at a crowd and a faceless figure in white below, ancient Jericho cityscape, warm afternoon light',
        
        // The Lost Sheep
        'A faceless shepherd figure carrying a small lamb on his shoulders, walking through a dramatic mountain valley at sunset, flock of sheep waiting in the distance, emotional rescue scene',
        
        // Feeding the 5000 aftermath
        'Twelve baskets overflowing with bread pieces on a grassy hillside overlooking the Sea of Galilee, scattered crumbs, sunset light, aftermath of a miracle',
        
        // Road to Emmaus
        'Three faceless figures walking on a dusty road at sunset, one in white robes, rolling hills landscape, warm golden light, sense of revelation and companionship'
      ]
      const randomEvangelScene = evangelScenes[Math.floor(Math.random() * evangelScenes.length)]
      return `${randomEvangelScene}. ${evangelCinematicStyle}`
    }
  }
}

// Generate image using Google Gemini with native image generation
export async function generateImageWithGemini(type: ContentType, style: string, evangelContext?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  
  const prompt = getImagePrompt(type, style, evangelContext)

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
