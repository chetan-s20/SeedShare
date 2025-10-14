import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize SeedSearch AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// Format response to remove asterisks and use numbered lists
function formatResponse(text: string): string {
  // Split into lines
  const lines = text.split('\n')
  let counter = 0
  let inList = false
  
  const formattedLines = lines.map(line => {
    // Check if line starts with asterisk, bullet, or dash
    const bulletMatch = line.match(/^\s*[\*\•\-]\s*\*?\*?(.+)$/)
    
    if (bulletMatch) {
      // Start or continue numbered list
      if (!inList) {
        counter = 1
        inList = true
      } else {
        counter++
      }
      return `${counter}. ${bulletMatch[1].replace(/^\*+/, '').trim()}`
    } else if (line.trim() === '') {
      // Empty line resets the list
      inList = false
      counter = 0
      return line
    } else {
      // Regular line
      inList = false
      counter = 0
      return line
    }
  })
  
  return formattedLines.join('\n')
}

// Simple web search function using DuckDuckGo (no API key needed)
async function searchWeb(query: string): Promise<string> {
  try {
    // Use DuckDuckGo Instant Answer API (free, no key needed)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { 
        method: 'GET',
        headers: { 'User-Agent': 'SeedShare-Bot/1.0' }
      }
    )
    
    if (!response.ok) {
      return ''
    }
    
    const data = await response.json()
    
    // Extract relevant information
    let searchResults = ''
    
    if (data.Abstract) {
      searchResults += `${data.Abstract}\n\n`
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      searchResults += 'Related Information:\n'
      data.RelatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
        if (topic.Text) {
          searchResults += `${index + 1}. ${topic.Text}\n`
        }
      })
    }
    
    return searchResults.trim()
  } catch (error) {
    console.error('Web search error:', error)
    return ''
  }
}

const SYSTEM_PROMPTS = {
  english: `You are an agricultural expert helping Indian farmers. Give practical farming advice based on both your knowledge and current web information.

CRITICAL FORMATTING RULES - MUST FOLLOW:
1. ALWAYS use numbered lists (1. 2. 3. 4.) for any steps or points
2. NEVER EVER use asterisks (*) - they are FORBIDDEN
3. NEVER use bullet points (•) or dashes (-)
4. If you use asterisks, the response will be rejected
5. Keep responses under 250 words
6. Use simple English
7. Give specific, actionable advice

CORRECT FORMAT EXAMPLE:
"To grow sunflowers in India:

1. Choose high-oil varieties like KBSH 44 or DRSH-1
2. Prepare well-drained soil with pH 6.0-7.5
3. Sow seeds 45 cm apart in rows 60 cm apart
4. Water regularly during flowering
5. Harvest when back of flower turns yellow

Best time: January-February or July-August"

WRONG FORMAT (DO NOT USE):
"To grow sunflowers:
* Choose varieties (WRONG - uses asterisk)
• Prepare soil (WRONG - uses bullet)
- Sow seeds (WRONG - uses dash)

Remember: Only use numbers (1. 2. 3.) - NO asterisks or bullets!`,

  hindi: `आप एक कृषि विशेषज्ञ हैं जो भारतीय किसानों की मदद कर रहे हैं।

महत्वपूर्ण फ़ॉर्मेटिंग नियम - अवश्य पालन करें:
1. हमेशा क्रमांकित सूची (1. 2. 3. 4.) का उपयोग करें
2. तारे (*) का उपयोग बिल्कुल न करें - ये प्रतिबंधित हैं
3. बुलेट पॉइंट (•) या डैश (-) का उपयोग न करें
4. 250 शब्दों से कम में उत्तर दें
5. सरल हिंदी का प्रयोग करें
6. व्यावहारिक सलाह दें

याद रखें: केवल नंबर (1. 2. 3.) का उपयोग करें - कोई तारे या बुलेट नहीं!`,

  punjabi: `ਤੁਸੀਂ ਇੱਕ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਹੋ ਜੋ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਦੀ ਮਦਦ ਕਰ ਰਹੇ ਹੋ।

ਜ਼ਰੂਰੀ ਫਾਰਮੈਟਿੰਗ ਨਿਯਮ - ਲਾਜ਼ਮੀ ਪਾਲਣਾ ਕਰੋ:
1. ਹਮੇਸ਼ਾ ਨੰਬਰ ਵਾਲੀ ਸੂਚੀ (1. 2. 3. 4.) ਵਰਤੋ
2. ਤਾਰੇ (*) ਬਿਲਕੁਲ ਨਾ ਵਰਤੋ - ਇਹ ਮਨ੍ਹਾ ਹਨ
3. ਬੁਲੇਟ ਪੁਆਇੰਟ (•) ਜਾਂ ਡੈਸ਼ (-) ਨਾ ਵਰਤੋ
4. 250 ਸ਼ਬਦਾਂ ਤੋਂ ਘੱਟ ਵਿੱਚ ਜਵਾਬ ਦਿਓ
5. ਸਰਲ ਪੰਜਾਬੀ ਵਰਤੋ
6. ਵਿਹਾਰਕ ਸਲਾਹ ਦਿਓ

ਯਾਦ ਰੱਖੋ: ਸਿਰਫ਼ ਨੰਬਰ (1. 2. 3.) ਵਰਤੋ - ਕੋਈ ਤਾਰੇ ਜਾਂ ਬੁਲੇਟ ਨਹੀਂ!`,

  haryanvi: `थम एक खेती के माहिर सो जो हरियाणा के किसानां की मदद करण लागरया सो।

जरूरी फॉर्मेटिंग नियम - पक्का पालन करो:
1. हमेशा नंबर वाली सूची (1. 2. 3. 4.) काम म्ह ल्यो
2. तारे (*) बिल्कुल ना लगाओ - ये मना सै
3. बुलेट पॉइंट (•) या डैश (-) ना लगाओ
4. 250 शब्दां तै कम म्ह जवाब द्यो
5. साधी हरयाणवी बोल्लो
6. काम की सलाह द्यो

याद राक्खो: सिर्फ नंबर (1. 2. 3.) लगाओ - कोए तारे या बुलेट नहीं!`
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

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured. Please add GOOGLE_API_KEY to your .env.local file. Get a free key from https://aistudio.google.com/app/apikey' },
        { status: 500 }
      )
    }

    // Get the system prompt for selected language
    const systemPrompt = SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.english

    // Perform web search for relevant queries
    let webContext = ''
    const shouldSearch = message.toLowerCase().includes('price') ||
                        message.toLowerCase().includes('weather') ||
                        message.toLowerCase().includes('current') ||
                        message.toLowerCase().includes('latest') ||
                        message.toLowerCase().includes('market') ||
                        message.toLowerCase().includes('news') ||
                        message.toLowerCase().includes('today') ||
                        message.toLowerCase().includes('mandi') ||
                        message.length > 50 // Complex questions likely benefit from search

    if (shouldSearch) {
      const searchResults = await searchWeb(message)
      if (searchResults) {
        webContext = `\n\nWeb Search Results:\n${searchResults}\n\n`
      }
    }

    // Get the generative model (backend uses Google's Gemini API)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp', // Backend model (user sees "SeedSearch AI")
      systemInstruction: systemPrompt,
    })

    // Build chat history - MUST start with user message
    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })) || []

    // Remove welcome message if it's the first message (assistant greeting)
    // Gemini requires chat history to start with 'user', not 'model'
    const validHistory = chatHistory.filter((msg: any, index: number) => {
      // If first message is from model (assistant welcome), skip it
      if (index === 0 && msg.role === 'model') {
        return false
      }
      return true
    })

    // Configuration
    const generationConfig = {
      maxOutputTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    }

    // Start chat with history
    const chat = model.startChat({
      history: validHistory.slice(0, -1), // Exclude the last user message as it's sent separately
      generationConfig,
    })

    // Enhance message with web context if available
    const enhancedMessage = webContext 
      ? `${message}${webContext}Please provide accurate information based on both your knowledge and the web search results above.`
      : message

    // Send message and get response
    const result = await chat.sendMessage(enhancedMessage)
    const response = result.response
    let text = response.text()

    // Ensure response is complete
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI')
    }

    // Post-process: Convert asterisks to numbered lists
    text = formatResponse(text)

    return NextResponse.json({
      response: text,
      model: 'seedsearch-ai-v1',
      tokenCount: text.split(' ').length, // Approximate word count
      searchUsed: shouldSearch && webContext.length > 0, // Indicate if web search was used
    })
  } catch (error: any) {
    console.error('SeedSearch AI error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get AI response',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
