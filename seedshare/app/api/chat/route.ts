import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY || '')

const SYSTEM_PROMPTS = {
  english: `You are an agricultural expert helping Indian farmers. Give practical farming advice.

IMPORTANT FORMATTING RULES:
- Use numbered lists (1. 2. 3.) for steps
- NEVER use asterisks (*) or bullet points (•)
- Keep responses under 250 words
- Use simple English
- Give specific, actionable advice

Example format:
"To store tomato seeds:

1. Select ripe tomatoes from healthy plants
2. Squeeze seeds into a jar with water
3. Ferment for 3-4 days (stir daily)
4. Rinse to remove pulp
5. Dry on paper for 1-2 weeks
6. Store in cool, dry place

Seeds stay good for 3-5 years."

Always format like this - clear, numbered, no asterisks.`,

  hindi: `आप एक कृषि विशेषज्ञ हैं जो भारतीय किसानों की मदद कर रहे हैं।

महत्वपूर्ण नियम:
- क्रमांकित सूची (1. 2. 3.) का उपयोग करें
- तारे (*) या बुलेट पॉइंट का उपयोग बिल्कुल न करें
- 250 शब्दों से कम में उत्तर दें
- सरल हिंदी का प्रयोग करें
- व्यावहारिक सलाह दें`,

  punjabi: `ਤੁਸੀਂ ਇੱਕ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਹੋ ਜੋ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਦੀ ਮਦਦ ਕਰ ਰਹੇ ਹੋ।

ਜ਼ਰੂਰੀ ਨਿਯਮ:
- ਨੰਬਰ ਵਾਲੀ ਸੂਚੀ (1. 2. 3.) ਵਰਤੋ
- ਤਾਰੇ (*) ਜਾਂ ਬੁਲੇਟ ਪੁਆਇੰਟ ਬਿਲਕੁਲ ਨਾ ਵਰਤੋ
- 250 ਸ਼ਬਦਾਂ ਤੋਂ ਘੱਟ ਵਿੱਚ ਜਵਾਬ ਦਿਓ
- ਸਰਲ ਪੰਜਾਬੀ ਵਰਤੋ
- ਵਿਹਾਰਕ ਸਲਾਹ ਦਿਓ`,

  haryanvi: `थम एक खेती के माहिर सो जो हरियाणा के किसानां की मदद करण लागरया सो।

जरूरी नियम:
- नंबर वाली सूची (1. 2. 3.) काम म्ह ल्यो
- तारे (*) या बुलेट बिल्कुल ना लगाओ
- 250 शब्दां तै कम म्ह जवाब द्यो
- साधी हरयाणवी बोल्लो
- काम की सलाह द्यो`
}

export async function POST(request: NextRequest) {
  try {
    const { message, history, language = 'english' } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Get the system prompt for selected language
    const systemPrompt = SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.english

    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt,
    })

    // Build chat history
    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })) || []

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // Exclude the last user message as it's sent separately
      generationConfig: {
        maxOutputTokens: 2048, // Increased for complete responses
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    })

    // Send message and get response
    const result = await chat.sendMessage(message)
    const response = result.response
    const text = response.text()

    // Ensure response is complete
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini')
    }

    return NextResponse.json({
      response: text,
      model: 'gemini-2.0-flash-exp',
      tokenCount: text.split(' ').length, // Approximate word count
    })
  } catch (error: any) {
    console.error('Gemini API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get AI response',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
