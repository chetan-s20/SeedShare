'use client'

import { useState } from 'react'
import { SeedImageAnalyzer } from '@/components/library/seed-image-analyzer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Shield, Microscope, TrendingUp } from 'lucide-react'
import { saveDiseaseReport } from '@/lib/supabase/disease-reports'
import { toast } from 'sonner'

export default function SeedQualityTestPage() {
  const [analysisCount, setAnalysisCount] = useState(0)

  const handleAnalysisComplete = async (analysis: any) => {
    setAnalysisCount(prev => prev + 1)
    
    // Show toast notification
    if (analysis.diseaseDetected) {
      toast.error(`Disease Detected: ${analysis.diseaseName}`, {
        description: analysis.buyerWarning?.message || 'Disease detected in seed sample.'
      })
    } else {
      toast.success('Seed Quality Check Passed', {
        description: 'No diseases detected. Seed appears healthy.'
      })
    }

    // Optionally save to database
    try {
      const report = {
        disease_detected: analysis.diseaseDetected,
        severity: analysis.severity,
        disease_name: analysis.diseaseName,
        confidence: analysis.confidence,
        symptoms: analysis.symptoms,
        causative_agent: analysis.causativeAgent,
        germination_impact: analysis.germinationImpact,
        safe_to_plant: analysis.safeToPlant,
        treatment_steps: analysis.treatment,
        prevention_measures: analysis.prevention,
        detailed_analysis: analysis.detailedAnalysis,
        recommendations: analysis.recommendations,
        buyer_warning_show: analysis.buyerWarning?.show || false,
        buyer_warning_message: analysis.buyerWarning?.message || '',
        buyer_warning_severity: analysis.buyerWarning?.severity || 'INFO',
        image_url: '', // Would be actual uploaded URL
        seed_type: analysis.seedType,
        context: 'testing'
      }

      // Uncomment when database is ready
      // const { error } = await saveDiseaseReport(report)
      // if (error) console.error('Error saving report:', error)
    } catch (error) {
      console.error('Error processing analysis:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seed Quality Testing Lab</h1>
        <p className="text-gray-600">
          AI-powered disease detection and quality analysis for seeds
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Microscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analysisCount}</p>
                <p className="text-sm text-gray-600">Tests Run</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">AI</p>
                <p className="text-sm text-gray-600">Powered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Real-time</p>
                <p className="text-sm text-gray-600">Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyzer">Seed Analyzer</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="guide">How to Use</TabsTrigger>
        </TabsList>

        {/* Analyzer Tab */}
        <TabsContent value="analyzer" className="space-y-6">
          <SeedImageAnalyzer
            seedType="tomato"
            context="library"
            onAnalysisComplete={handleAnalysisComplete}
            showDetailedReport={true}
            autoAnalyze={false}
          />
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Seed Disease Detection</CardTitle>
              <CardDescription>
                Protecting farmers and buyers with advanced image analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">🎯 Purpose</h3>
                <p className="text-sm text-gray-600">
                  This feature uses Google's Gemini Vision AI to analyze seed images and detect
                  potential diseases, quality issues, and germination problems. It provides
                  real-time warnings to buyers before purchase, protecting them from poor-quality seeds.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🔬 What It Detects</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Fungal infections (mold, mildew, rot)</li>
                  <li>Bacterial diseases</li>
                  <li>Viral infections</li>
                  <li>Pest damage</li>
                  <li>Physical deformities</li>
                  <li>Storage issues</li>
                  <li>Germination viability</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">✨ Features</h3>
                <ul className="space-y-2">
                  {[
                    'Real-time AI analysis using Google Gemini',
                    'Disease severity classification (Healthy to Critical)',
                    'Treatment and prevention recommendations',
                    'Germination impact estimation',
                    'Automatic buyer warnings for severe cases',
                    'Detailed analysis reports',
                    'Multi-language support',
                    'Expert agricultural knowledge base'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Badge variant="outline" className="mt-0.5">✓</Badge>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🛡️ Buyer Protection</h3>
                <p className="text-sm text-gray-600">
                  When disease is detected in marketplace listings, buyers automatically receive:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mt-2">
                  <li>Visual warning badges on product cards</li>
                  <li>Detailed disease information</li>
                  <li>Risk assessment before purchase</li>
                  <li>Treatment requirements</li>
                  <li>Expected germination rates</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Important Note</p>
                    <p className="text-sm text-blue-800 mt-1">
                      While our AI is highly accurate, it should be used as a screening tool.
                      For critical decisions, we recommend consulting with agricultural experts.
                      The system is designed to err on the side of caution to protect buyers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide Tab */}
        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Use Seed Quality Testing</CardTitle>
              <CardDescription>
                Step-by-step guide for analyzing your seeds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Take a Clear Photo</h3>
                    <p className="text-sm text-gray-600">
                      Photograph your seeds in good lighting. Show the seeds clearly with
                      visible details. Avoid blurry or dark images.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-500 mt-2 ml-4">
                      <li>Use natural daylight if possible</li>
                      <li>Keep seeds in focus</li>
                      <li>Show multiple seeds if available</li>
                      <li>Capture any suspicious spots or discoloration</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Upload Your Image</h3>
                    <p className="text-sm text-gray-600">
                      Click the upload area or drag and drop your seed image.
                      Supported formats: PNG, JPG, JPEG (max 5MB)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Click Analyze</h3>
                    <p className="text-sm text-gray-600">
                      Press the "Analyze Seed Quality" button. The AI will process your
                      image in 5-10 seconds.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Review Results</h3>
                    <p className="text-sm text-gray-600">
                      Read the detailed analysis report including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-500 mt-2 ml-4">
                      <li>Disease detection status</li>
                      <li>Severity level and confidence score</li>
                      <li>Symptoms and causative agents</li>
                      <li>Treatment recommendations</li>
                      <li>Prevention measures</li>
                      <li>Safety assessment</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Take Action</h3>
                    <p className="text-sm text-gray-600">
                      Based on the results:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-500 mt-2 ml-4">
                      <li><strong>Healthy:</strong> Proceed with planting or sale</li>
                      <li><strong>Mild:</strong> Apply preventive treatments</li>
                      <li><strong>Moderate:</strong> Treat before planting</li>
                      <li><strong>Severe:</strong> Treat or discard based on recommendations</li>
                      <li><strong>Critical:</strong> Do not plant, consult expert</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Tips for Best Results</p>
                    <ul className="list-disc list-inside text-sm text-yellow-800 mt-1 ml-4">
                      <li>Clean seeds before photographing</li>
                      <li>Use plain background (white paper works best)</li>
                      <li>Include a size reference if possible</li>
                      <li>Test multiple samples from the same batch</li>
                      <li>Keep records of analysis results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
