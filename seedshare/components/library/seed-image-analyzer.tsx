'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, Upload, Loader2, AlertTriangle, Info } from 'lucide-react'
import Image from 'next/image'

interface DiseaseAnalysis {
  diseaseDetected: boolean
  severity: 'HEALTHY' | 'MILD' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  diseaseName: string
  confidence: number
  symptoms: string[]
  causativeAgent: string
  germinationImpact: string
  treatment: string[]
  prevention: string[]
  safeToPlant: boolean
  buyerWarning?: {
    show: boolean
    message: string
    severity: 'INFO' | 'WARNING' | 'DANGER'
  }
  detailedAnalysis: string
  recommendations: string
  analyzedAt?: string
  seedType?: string
}

interface SeedImageAnalyzerProps {
  seedType?: string
  context?: 'marketplace' | 'library' | 'community'
  onAnalysisComplete?: (analysis: DiseaseAnalysis) => void
  showDetailedReport?: boolean
  autoAnalyze?: boolean
}

export function SeedImageAnalyzer({
  seedType = 'unknown',
  context = 'marketplace',
  onAnalysisComplete,
  showDetailedReport = true,
  autoAnalyze = false
}: SeedImageAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
    setAnalysis(null)

    // Auto-analyze if enabled
    if (autoAnalyze) {
      analyzeImage(file)
    }
  }

  const analyzeImage = async (imageFile?: File) => {
    const file = imageFile || selectedImage
    if (!file) return

    setAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('seedType', seedType)
      formData.append('context', context)

      const response = await fetch('/api/analyze-seed', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze image')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze seed image')
      console.error('Analysis error:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HEALTHY': return 'bg-green-500'
      case 'MILD': return 'bg-yellow-500'
      case 'MODERATE': return 'bg-orange-500'
      case 'SEVERE': return 'bg-red-500'
      case 'CRITICAL': return 'bg-red-700'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HEALTHY': return <CheckCircle className="w-5 h-5" />
      case 'MILD': return <Info className="w-5 h-5" />
      case 'MODERATE': return <AlertTriangle className="w-5 h-5" />
      case 'SEVERE': return <AlertCircle className="w-5 h-5" />
      case 'CRITICAL': return <XCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  const getWarningColor = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'DANGER': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Seed Quality Analysis
          </CardTitle>
          <CardDescription>
            Upload a seed image to detect diseases and quality issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Input */}
          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="seed-image-upload"
            />
            <label
              htmlFor="seed-image-upload"
              className="cursor-pointer w-full"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                {previewUrl ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={previewUrl}
                      alt="Seed preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to upload seed image
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </label>

            {selectedImage && !autoAnalyze && (
              <Button
                onClick={() => analyzeImage()}
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Analyze Seed Quality
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && showDetailedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Badge className={`${getSeverityColor(analysis.severity)} text-white`}>
                {analysis.severity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buyer Warning */}
            {analysis.buyerWarning?.show && (
              <div className={`border-2 rounded-lg p-4 ${getWarningColor(analysis.buyerWarning.severity)}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Buyer Alert</p>
                    <p className="text-sm mt-1">{analysis.buyerWarning.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Disease Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Disease Status</p>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(analysis.severity)}
                  <p className="font-semibold">
                    {analysis.diseaseDetected ? analysis.diseaseName : 'Healthy'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-semibold">{analysis.confidence}%</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600">Causative Agent</p>
                <p className="font-semibold">{analysis.causativeAgent}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600">Safe to Plant</p>
                <Badge variant={analysis.safeToPlant ? 'default' : 'destructive'}>
                  {analysis.safeToPlant ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Germination Impact */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Germination Impact</p>
              <p className="text-sm text-gray-600">{analysis.germinationImpact}</p>
            </div>

            {/* Symptoms */}
            {analysis.symptoms.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Symptoms Observed</p>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.symptoms.map((symptom, index) => (
                    <li key={index} className="text-sm text-gray-600">{symptom}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {analysis.treatment.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Treatment Recommendations</p>
                <ol className="list-decimal list-inside space-y-1">
                  {analysis.treatment.map((step, index) => (
                    <li key={index} className="text-sm text-gray-600">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Prevention */}
            {analysis.prevention.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Prevention Measures</p>
                <ol className="list-decimal list-inside space-y-1">
                  {analysis.prevention.map((step, index) => (
                    <li key={index} className="text-sm text-gray-600">{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Detailed Analysis */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Detailed Analysis</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{analysis.detailedAnalysis}</p>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Recommendations</p>
              <p className="text-sm text-gray-600">{analysis.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Analysis Summary */}
      {analysis && !showDetailedReport && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${getSeverityColor(analysis.severity)}`}>
                {getSeverityIcon(analysis.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{analysis.diseaseName}</h3>
                  <Badge className={getSeverityColor(analysis.severity) + ' text-white'}>
                    {analysis.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{analysis.detailedAnalysis.substring(0, 150)}...</p>
                {analysis.buyerWarning?.show && (
                  <div className={`mt-3 p-3 rounded-lg ${getWarningColor(analysis.buyerWarning.severity)}`}>
                    <p className="text-sm font-semibold">{analysis.buyerWarning.message}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
