import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY || '')

// Validate and fix analysis consistency
function validateAndFixAnalysis(analysis: any): any {
  // Check if symptoms indicate disease but seedCondition is healthy
  const hasNegativeSymptoms = analysis.symptoms?.some((symptom: string) => {
    const lowerSymptom = symptom.toLowerCase()
    return lowerSymptom.includes('discoloration') ||
           lowerSymptom.includes('mold') ||
           lowerSymptom.includes('rot') ||
           lowerSymptom.includes('damage') ||
           lowerSymptom.includes('disease') ||
           lowerSymptom.includes('decay') ||
           lowerSymptom.includes('breakdown') ||
           lowerSymptom.includes('fungal') ||
           lowerSymptom.includes('bacterial') ||
           lowerSymptom.includes('infection') ||
           lowerSymptom.includes('pathogen') ||
           lowerSymptom.includes('shriveling') ||
           lowerSymptom.includes('degradation')
  })

  // If there are negative symptoms OR diseases detected, ensure seedCondition is not "healthy"
  if ((hasNegativeSymptoms || analysis.diseasesDetected?.length > 0) && analysis.seedCondition === 'healthy') {
    console.warn('Fixing inconsistent analysis: Found disease symptoms but seedCondition was "healthy"')
    
    // Determine appropriate condition based on symptoms
    if (analysis.symptoms?.some((s: string) => s.toLowerCase().includes('mold'))) {
      analysis.seedCondition = 'moldy'
    } else if (analysis.symptoms?.some((s: string) => s.toLowerCase().includes('rot') || s.toLowerCase().includes('decay'))) {
      analysis.seedCondition = 'diseased'
    } else if (analysis.symptoms?.some((s: string) => s.toLowerCase().includes('damage'))) {
      analysis.seedCondition = 'damaged'
    } else {
      analysis.seedCondition = 'diseased'
    }
    
    // Adjust severity if it was "none"
    if (analysis.severity === 'none') {
      // Determine severity based on symptom count and severity keywords
      const symptomCount = analysis.symptoms?.length || 0
      const hasSevereKeywords = analysis.symptoms?.some((s: string) => {
        const lower = s.toLowerCase()
        return lower.includes('severe') || lower.includes('extensive') || lower.includes('advanced')
      })
      
      if (hasSevereKeywords || symptomCount >= 4) {
        analysis.severity = 'severe'
      } else if (symptomCount >= 2) {
        analysis.severity = 'moderate'
      } else {
        analysis.severity = 'mild'
      }
    }
  }
  
  // Ensure severity matches seedCondition
  if (analysis.seedCondition === 'healthy' && analysis.severity !== 'none') {
    analysis.severity = 'none'
  }
  
  return analysis
}

// Transform analysis to UI-compatible format
function transformAnalysisForUI(analysis: any): any {
  // Map seedCondition to UI-expected format
  const isDiseased = analysis.seedCondition !== 'healthy'
  
  // Convert severity to uppercase and map "none" to "HEALTHY"
  let uiSeverity = analysis.severity?.toUpperCase() || 'UNKNOWN'
  if (uiSeverity === 'NONE' || analysis.seedCondition === 'healthy') {
    uiSeverity = 'HEALTHY'
  }
  
  // Determine disease name
  let diseaseName = 'No Disease Detected'
  if (isDiseased) {
    if (analysis.diseasesDetected && analysis.diseasesDetected.length > 0) {
      diseaseName = analysis.diseasesDetected.join(', ')
    } else {
      // Derive from seedCondition
      diseaseName = analysis.seedCondition.charAt(0).toUpperCase() + analysis.seedCondition.slice(1)
    }
  }
  
  // Convert confidence score from 0-1 to 0-100
  const confidencePercentage = Math.round((analysis.confidenceScore || 0) * 100)
  
  // Determine buyer warning
  const buyerWarning = {
    show: isDiseased && (uiSeverity === 'SEVERE' || uiSeverity === 'CRITICAL'),
    message: isDiseased 
      ? `Warning: ${diseaseName} detected. ${analysis.safeToPlant === false ? 'Not safe to plant.' : 'May affect germination.'}`
      : 'Seed appears healthy.',
    severity: uiSeverity === 'CRITICAL' ? 'DANGER' : uiSeverity === 'SEVERE' ? 'WARNING' : 'INFO'
  }
  
  return {
    diseaseDetected: isDiseased,
    severity: uiSeverity,
    diseaseName: diseaseName,
    confidence: confidencePercentage,
    symptoms: analysis.symptoms || [],
    causativeAgent: analysis.possibleCauses?.join(', ') || 'N/A',
    germinationImpact: analysis.viabilityAssessment || 'Not assessed',
    treatment: analysis.recommendations || [],
    prevention: analysis.preventiveMeasures || [],
    safeToPlant: analysis.seedCondition === 'healthy' || analysis.severity === 'none' || analysis.severity === 'mild',
    buyerWarning: buyerWarning,
    detailedAnalysis: analysis.detailedAnalysis || '',
    recommendations: analysis.storageAdvice || '',
    seedType: analysis.seedType || 'unknown',
    analyzedAt: new Date().toISOString(),
    // Keep original analysis for reference
    _originalAnalysis: analysis
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    const additionalContext = formData.get('context') as string || ''

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate image type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 })
    }

    // Validate image size (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size should be less than 5MB' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Upload image to Supabase Storage
    const fileName = `analysis/${user.id}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('seed-images')
      .upload(fileName, buffer, {
        contentType: image.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image', details: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('seed-images')
      .getPublicUrl(fileName)

    // Analyze image with Gemini Vision
    // Using gemini-2.5-flash for fast, accurate vision analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an expert agricultural pathologist specializing in seed health diagnosis. Analyze this seed image and provide a comprehensive diagnostic report.

Additional context from user: ${additionalContext}

CRITICAL INSTRUCTION: You must ensure that seedCondition and symptoms are CONSISTENT with each other:
- IF you observe ANY negative symptoms (discoloration, mold, rot, damage, disease signs), then seedCondition MUST be "diseased", "damaged", "infested", or "moldy" - NEVER "healthy"
- IF seedCondition is "healthy", then symptoms array MUST be EMPTY or contain only positive observations
- The severity level must match the seedCondition:
  - "healthy" → severity: "none"
  - "diseased/damaged/moldy/infested" with minor issues → severity: "mild"
  - "diseased/damaged/moldy/infested" with moderate issues → severity: "moderate"
  - "diseased/damaged/moldy/infested" with major issues → severity: "severe"

Provide your analysis in this exact JSON structure (no markdown, just raw JSON):
{
  "seedCondition": "healthy|diseased|damaged|infested|moldy|unknown",
  "confidenceScore": 0.85,
  "diseasesDetected": ["disease name 1", "disease name 2"],
  "symptoms": ["symptom 1", "symptom 2"],
  "severity": "none|mild|moderate|severe",
  "possibleCauses": ["cause 1", "cause 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "medicinesSuggested": [
    {
      "name": "Medicine Name",
      "type": "fungicide|insecticide|bactericide|organic",
      "dosage": "specific dosage",
      "applicationMethod": "how to apply",
      "precautions": "safety measures"
    }
  ],
  "preventiveMeasures": ["prevention tip 1", "prevention tip 2"],
  "storageAdvice": "proper storage recommendations",
  "viabilityAssessment": "assessment of seed viability and germination potential",
  "detailedAnalysis": "A detailed paragraph explaining all findings, observations, and reasoning"
}

Important: 
- ALWAYS ensure seedCondition matches the symptoms - if symptoms are negative, seedCondition CANNOT be "healthy"
- Be specific and actionable in recommendations
- If you cannot confidently identify the condition, set seedCondition to "unknown" and explain why in detailedAnalysis
- Include only relevant medicines based on detected issues
- Provide realistic confidence scores (0.0 to 1.0)
- Focus on practical, implementable advice for farmers`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: image.type,
          data: base64Image,
        },
      },
    ])

    const response = result.response
    let text = response.text()
    
    // Clean up the response text
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Extract JSON from response
    let analysis
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json({ 
        error: 'Failed to parse analysis results. AI response was not in expected format.',
        rawResponse: text.substring(0, 500) 
      }, { status: 500 })
    }

    // Validate analysis structure
    if (!analysis.seedCondition || !analysis.confidenceScore) {
      return NextResponse.json({ 
        error: 'Invalid analysis structure received from AI',
        analysis 
      }, { status: 500 })
    }

    // Validate and fix any inconsistencies in the analysis
    analysis = validateAndFixAnalysis(analysis)

    // Transform to UI-compatible format
    const uiAnalysis = transformAnalysisForUI(analysis)

    // Save analysis to database (save original analysis structure)
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('seed_image_analysis')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        analysis_result: analysis, // Save original analysis
        seed_condition: analysis.seedCondition,
        confidence_score: analysis.confidenceScore,
        diseases_detected: analysis.diseasesDetected || [],
        recommendations: analysis.recommendations || [],
        medicines_suggested: analysis.medicinesSuggested || [],
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save analysis:', saveError)
      // Continue anyway, don't fail the request
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      analysis: uiAnalysis, // Return UI-compatible format
      analysisId: savedAnalysis?.id,
    })

  } catch (error: any) {
    console.error('Seed analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze seed image',
      details: error.message 
    }, { status: 500 })
  }
}

// GET endpoint to fetch analysis history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data: analyses, error } = await supabase
      .from('seed_image_analysis')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ analyses })

  } catch (error: any) {
    console.error('Failed to fetch analyses:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch analysis history',
      details: error.message 
    }, { status: 500 })
  }
}
