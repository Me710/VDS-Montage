import { NextResponse } from 'next/server'

interface AelfLecture {
  type: string
  titre: string
  ref: string
  contenu: string
  intro_lue?: string
}

interface AelfMesse {
  nom: string
  lectures: AelfLecture[]
}

interface AelfResponse {
  informations: {
    date: string
    jour_liturgique_nom: string
    fete?: string
  }
  messes: AelfMesse[]
}

// Fetch Gospel of the day from AELF.org API
export async function GET() {
  try {
    // Format today's date as YYYY-MM-DD
    const today = new Date()
    const date = today.toISOString().split('T')[0]
    
    // AELF API endpoint for daily Mass readings
    const apiUrl = `https://api.aelf.org/v1/messes/${date}/france`
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store' // Always fetch fresh data
    })
    
    if (!response.ok) {
      throw new Error(`AELF API error: ${response.status}`)
    }
    
    const data = await response.json() as AelfResponse
    
    // Find the Gospel reading in the lectures array
    const messe = data.messes?.[0]
    if (!messe || !messe.lectures) {
      return NextResponse.json(
        { error: "Messe non trouvée pour cette date" },
        { status: 404 }
      )
    }
    
    // Find the "evangile" type in lectures
    const evangile = messe.lectures.find(l => l.type === 'evangile')
    
    if (!evangile) {
      return NextResponse.json(
        { error: "Évangile non trouvé pour cette date" },
        { status: 404 }
      )
    }
    
    // Clean up HTML tags from content
    const cleanContent = evangile.contenu
      .replace(/<br\s*\/?>/gi, ' ')  // Replace <br> with space
      .replace(/<p>/gi, '')           // Remove <p>
      .replace(/<\/p>/gi, '\n')       // Replace </p> with newline
      .replace(/<[^>]*>/g, '')        // Remove remaining HTML tags
      .replace(/&nbsp;/g, ' ')        // Replace nbsp
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\n\s+/g, '\n')        // Clean newlines
      .trim()
    
    // Remove the final "– Acclamons la Parole de Dieu." or similar
    const textWithoutEnding = cleanContent
      .replace(/–\s*Acclamons la Parole de Dieu\.?\s*$/i, '')
      .replace(/–\s*Parole du Seigneur\.?\s*$/i, '')
      .trim()
    
    // Extract a short verse - find a meaningful quote
    // Look for direct speech (between « »)
    const quoteMatch = textWithoutEnding.match(/«\s*([^»]+)\s*»/)
    let shortVerse = ''
    
    if (quoteMatch) {
      shortVerse = `« ${quoteMatch[1].trim()} »`
    } else {
      // Take first 2 sentences
      const sentences = textWithoutEnding.split(/[.!?]+/).filter(s => s.trim().length > 10)
      shortVerse = sentences.slice(0, 2).join('. ').trim()
      if (shortVerse && !shortVerse.endsWith('.')) shortVerse += '.'
    }
    
    // Create a nice title from the evangile titre or intro_lue
    const title = evangile.titre || "Évangile du jour"
    const intro = evangile.intro_lue || "Évangile"
    
    return NextResponse.json({
      date,
      title: title,
      intro: intro,
      reference: evangile.ref,
      liturgicalInfo: data.informations?.fete || data.informations?.jour_liturgique_nom || '',
      shortVerse: shortVerse.length > 250 ? shortVerse.substring(0, 250) + '...' : shortVerse,
      fullText: textWithoutEnding,
    })
    
  } catch (error) {
    console.error('AELF API error:', error)
    
    return NextResponse.json(
      { error: "Impossible de récupérer l'évangile. Vérifiez votre connexion." },
      { status: 500 }
    )
  }
}
