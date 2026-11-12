import { InferenceClient } from '@huggingface/inference'

// ─── Hugging Face Inference Providers ────────────────────────────────────────
// La clé est lue UNIQUEMENT depuis l'environnement (HF_TOKEN). Ne jamais la
// mettre dans le code ni dans un fichier commité.
//
// Modèles surchargeables sans redéploiement de code :
//   HF_IMAGE_MODEL (défaut : black-forest-labs/FLUX.1-schnell)
//   HF_TEXT_MODEL  (défaut : meta-llama/Llama-3.3-70B-Instruct)

const DEFAULT_IMAGE_MODEL = 'black-forest-labs/FLUX.1-schnell'
const DEFAULT_TEXT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct'

let hfClient: InferenceClient | null = null

export function getHfToken(): string | undefined {
  return process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || undefined
}

export function isHuggingFaceConfigured(): boolean {
  return Boolean(getHfToken())
}

function getHfClient(): InferenceClient {
  if (!hfClient) {
    const token = getHfToken()
    if (!token) {
      throw new Error('HF_TOKEN is not configured')
    }
    hfClient = new InferenceClient(token)
  }
  return hfClient
}

// Génère une image et la renvoie en data-URL base64 (même contrat que Pollinations).
export async function generateImageWithHuggingFace(prompt: string): Promise<string> {
  const blob = await getHfClient().textToImage(
    {
      model: process.env.HF_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
      inputs: prompt,
      parameters: { width: 768, height: 768 },
    },
    { outputType: 'blob' }
  )

  const buffer = Buffer.from(await blob.arrayBuffer())
  const mimeType = blob.type || 'image/jpeg'
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

// Génère du texte (chat completion) et renvoie le contenu brut du message.
export async function generateTextWithHuggingFace(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const response = await getHfClient().chatCompletion({
    model: process.env.HF_TEXT_MODEL || DEFAULT_TEXT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 1.0,
  })

  const text = response.choices?.[0]?.message?.content
  if (!text) {
    throw new Error('Empty response from Hugging Face')
  }
  return text
}
