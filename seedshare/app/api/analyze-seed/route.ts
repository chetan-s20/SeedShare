import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const seedType = formData.get('seedType') as string || 'unknown'
    const context = formData.get('context') as string || 'marketplace'

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Get the vision model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    })

    // Detailed prompt for seed disease detection
    const prompt = `You are an expert agricultural pathologist specializing in seed disease detection and crop health analysis for Indian farmers.

TASK: Analyze this seed/plant image and provide a comprehensive disease and quality assessment.

ANALYSIS REQUIRED:
1. **Disease Detection**: Identify any visible diseases, infections, or abnormalities
2. **Severity Level**: Rate as HEALTHY, MILD, MODERATE, SEVERE, or CRITICAL
3. **Disease Name**: Provide specific disease name (if detected)
4. **Symptoms Observed**: List visible symptoms (discoloration, spots, mold, rot, etc.)
5. **Causal Agent**: Identify pathogen (fungal, bacterial, viral, pest damage)
6. **Impact on Germination**: Estimate germination rate impact (percentage)
7. **Treatment Recommendations**: Suggest immediate treatments
8. **Prevention Measures**: Advise preventive actions
9. **Safety for Planting**: Determine if safe to plant or should be rejected
10. **Buyer Warning**: Should buyer be warned? (YES/NO with reason)

SEED TYPE: ${seedType}
CONTEXT: ${context === 'marketplace' ? 'Marketplace listing - buyer protection important' : 'Seed library - quality verification'}

RESPONSE FORMAT (JSON):
{
  "diseaseDetected": true/false,
  "severity": "HEALTHY|MILD|MODERATE|SEVERE|CRITICAL",
  "diseaseName": "Specific disease name or 'None detected'",
  "confidence": 0-100,
  "symptoms": ["symptom1", "symptom2"],
  "causativeAgent": "Fungal/Bacterial/Viral/Pest/None",
  "germinationImpact": "0-100% reduction expected",
  "treatment": ["treatment step 1", "treatment step 2"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "safeToPlant": true/false,
  "buyerWarning": {
    "show": true/false,
    "message": "Warning message for buyer",
    "severity": "INFO|WARNING|DANGER"
  },
  "detailedAnalysis": "Comprehensive paragraph explaining the findings",
  "recommendations": "Specific advice for buyer/seller"
}

IMPORTANT: 
- Be thorough and accurate
- Prioritize buyer safety
- If disease detected, provide clear warnings
- Consider Indian farming context
- Suggest local, affordable treatments
- If image is unclear, mention it in analysis

Analyze the image now:`

    // Analyze the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type
        }
      }
    ])

    const response = result.response
    let text = response.text()

    // Try to extract JSON from response
    let analysis
    try {
      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(text)
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
      const diseaseKeywords = ['disease', 'infection', 'rot', 'mold', 'fungus', 'bacteria', 'pest', 'damage']
      const hasDisease = diseaseKeywords.some(keyword => text.toLowerCase().includes(keyword))
      
      analysis = {
        diseaseDetected: hasDisease,
        severity: hasDisease ? 'MODERATE' : 'HEALTHY',
        diseaseName: hasDisease ? 'Potential disease detected' : 'None detected',
        confidence: 70,
        symptoms: [],
        causativeAgent: 'Unknown',
        germinationImpact: hasDisease ? '20-40% reduction possible' : 'Minimal impact',
        treatment: ['Consult agricultural expert for specific treatment'],
        prevention: ['Store seeds in dry, cool place', 'Use certified seeds'],
        safeToPlant: !hasDisease,
        buyerWarning: {
          show: hasDisease,
          message: hasDisease ? 'This seed may have quality issues. Verify before purchase.' : 'Seed appears healthy',
          severity: hasDisease ? 'WARNING' : 'INFO'
        },
        detailedAnalysis: text,
        recommendations: 'Detailed analysis available in the description'
      }
    }

    // Add metadata
    analysis.analyzedAt = new Date().toISOString()
    analysis.seedType = seedType
    analysis.imageSize = image.size
    analysis.imageType = image.type

    return NextResponse.json({
      success: true,
      analysis: analysis
    })

  } catch (error: any) {
    console.error('Seed analysis error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze seed image',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
