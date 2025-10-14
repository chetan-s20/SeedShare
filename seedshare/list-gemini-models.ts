// List Available Gemini Models
// Run: npx tsx list-gemini-models.ts

import { GoogleGenerativeAI } from '@google/generative-ai'

require('dotenv').config({ path: '.env.local' })

const apiKey = process.env.OPENAI_API_KEY!

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY not found in .env.local')
  process.exit(1)
}

console.log('🔍 Fetching available Gemini models...\n')

const genAI = new GoogleGenerativeAI(apiKey)

// List models
async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Failed to fetch models:', error)
      return
    }
    
    const data = await response.json()
    
    console.log('📋 Available Models:\n')
    
    const visionModels = data.models
      .filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent') &&
        model.name.includes('gemini')
      )
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
    
    visionModels.forEach((model: any) => {
      const shortName = model.name.replace('models/', '')
      const supportsVision = model.supportedGenerationMethods?.includes('generateContent')
      console.log(`✅ ${shortName}`)
      console.log(`   Description: ${model.description || 'N/A'}`)
      console.log(`   Input token limit: ${model.inputTokenLimit || 'N/A'}`)
      console.log(`   Output token limit: ${model.outputTokenLimit || 'N/A'}`)
      console.log(`   Supports vision: ${supportsVision ? 'Yes' : 'No'}`)
      console.log('')
    })
    
    console.log('\n💡 Recommended for seed image analysis:')
    const recommended = visionModels.find((m: any) => 
      m.name.includes('gemini-1.5-flash') || 
      m.name.includes('gemini-pro-vision')
    )
    
    if (recommended) {
      console.log(`   Use: ${recommended.name.replace('models/', '')}`)
    } else {
      console.log('   Use the first vision-capable model from the list above')
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

listModels()
