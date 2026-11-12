import { NextResponse } from 'next/server'
import { ApiError, fetchWithTimeout, handleRouteError } from '@/lib/api-server'

export const dynamic = 'force-dynamic'

// Date du jour au fuseau de Paris (calendrier liturgique « france » d'AELF).
// toISOString() donnerait la date UTC, donc l'évangile du lendemain en soirée.
function todayInParis(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

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
    const date = todayInParis()

    // AELF API endpoint for daily Mass readings
    const apiUrl = `https://api.aelf.org/v1/messes/${date}/france`

    let response: Response
    try {
      response = await fetchWithTimeout(
        apiUrl,
        { headers: { Accept: 'application/json' }, cache: 'no-store' },
        12_000
      )
    } catch {
      throw new ApiError(502, 'upstream_error', "AELF.org ne répond pas. Réessayez dans un instant.")
    }

    if (!response.ok) {
      throw new ApiError(502, 'upstream_error', "AELF.org est momentanément indisponible. Réessayez dans un instant.")
    }

    const data = await response.json().catch(() => null) as AelfResponse | null
    if (!data) {
      throw new ApiError(502, 'upstream_error', "Réponse inattendue d'AELF.org. Réessayez dans un instant.")
    }

    // Find the Gospel reading in the lectures array
    const messe = data.messes?.[0]
    if (!messe || !Array.isArray(messe.lectures)) {
      throw new ApiError(404, 'not_found', 'Messe non trouvée pour cette date.')
    }
    
    // Find the "evangile" type in lectures
    const evangile = messe.lectures.find(l => l.type === 'evangile')
    
    if (!evangile || typeof evangile.contenu !== 'string') {
      throw new ApiError(404, 'not_found', 'Évangile non trouvé pour cette date.')
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
    return handleRouteError(error, 'evangile', "Impossible de récupérer l'évangile du jour. Merci de réessayer.")
  }
}
