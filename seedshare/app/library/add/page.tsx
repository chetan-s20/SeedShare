'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload, Leaf, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createSeedQRCode } from '@/lib/qr-utils'
import { cn } from '@/lib/utils'

type UploadedImage = {
  path: string | null
  url: string
  source: 'storage' | 'inline'
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

const shouldFallbackToInlineStorage = (error: unknown) => {
  const message = typeof error === 'string'
    ? error.toLowerCase()
    : (typeof error === 'object' && error && 'message' in error)
      ? String((error as any).message ?? '').toLowerCase()
      : ''

  const status = (typeof error === 'object' && error && 'statusCode' in error)
    ? String((error as any).statusCode)
    : (typeof error === 'object' && error && 'status' in error)
      ? String((error as any).status)
      : null

  return (
    status === '404' ||
    status === '401' ||
    status === '403' ||
    message.includes('bucket not found') ||
    message.includes('does not exist') ||
    message.includes('not authorized') ||
    message.includes('permission denied') ||
    message.includes('row-level security')
  )
}

export default function AddSeedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const categories = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Flowers',
    'Grains',
    'Legumes',
    'Other'
  ]

  const handleFilesUpload = async (files: File[]) => {
    if (!files.length) return

    const remainingSlots = 5 - uploadedImages.length
    if (remainingSlots <= 0) {
      toast.error('You can upload up to 5 images per seed entry.')
      return
    }

    setIsUploadingImages(true)

    const validFiles = files
      .filter((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a supported image type.`)
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 5MB size limit.`)
          return false
        }
        return true
      })
      .slice(0, remainingSlots)

    if (files.length > remainingSlots) {
      toast.warning(`You can upload only ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}.`)
    }

    if (!validFiles.length) {
      setIsUploadingImages(false)
      return
    }

    let supabase: ReturnType<typeof createClient> | null = null
    let userId: string | null = null

    try {
      supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Please log in to upload images.')
        setIsUploadingImages(false)
        return
      }

      userId = user.id
    } catch (clientError) {
      console.error('Supabase initialization failed:', clientError)
      toast.warning('Supabase storage is not configured. Images will be stored inline temporarily.')
      supabase = null
    }

    try {
      const uploads: UploadedImage[] = []
      const failed: string[] = []
      let inlineFallbackCount = 0
      let warnedMissingBucket = false

      for (const file of validFiles) {
        let storedInSupabase = false

        if (supabase && userId) {
          const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const baseName = file.name.replace(/\.[^/.]+$/, '')
          const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'image'
          const uniqueToken = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10)
          const filePath = `${userId}/seed-${uniqueToken}-${sanitizedBaseName}.${extension}`

          try {
            const { error: uploadError } = await supabase.storage
              .from('seed-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'image/jpeg'
              })

            if (uploadError) {
              throw uploadError
            }

            const { data: publicUrlData } = supabase.storage
              .from('seed-images')
              .getPublicUrl(filePath)

            if (!publicUrlData?.publicUrl) {
              throw new Error('Failed to resolve public URL for uploaded image.')
            }

            uploads.push({
              path: filePath,
              url: publicUrlData.publicUrl,
              source: 'storage'
            })
            storedInSupabase = true
          } catch (uploadError) {
            console.error('Seed image upload failed:', uploadError)

            if (shouldFallbackToInlineStorage(uploadError) && !warnedMissingBucket) {
              toast.warning('Cannot upload to Supabase bucket "seed-images" (missing or permission denied). Using inline images until storage is configured.')
              warnedMissingBucket = true
            }
          }
        }

        if (!storedInSupabase) {
          try {
            const dataUrl = await readFileAsDataUrl(file)
            uploads.push({
              path: null,
              url: dataUrl,
              source: 'inline'
            })
            inlineFallbackCount += 1
          } catch (fileError) {
            console.error('Failed to convert file to inline image:', fileError)
            failed.push(file.name)
          }
        }
      }

      if (uploads.length) {
        setUploadedImages((prev) => [...prev, ...uploads])
        toast.success(`${uploads.length} image${uploads.length > 1 ? 's' : ''} ready.`)
      }

      if (inlineFallbackCount > 0) {
        toast.warning('Some images are stored inline. Configure the "seed-images" bucket in Supabase (create it or adjust policies) for best performance.')
      }

      if (failed.length) {
        toast.error(`Could not process: ${failed.join(', ')}`)
      }
    } catch (processError) {
      console.error('Failed to process seed images:', processError)
      toast.error('Failed to process images. Please try again.')
    } finally {
      setIsUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (image: UploadedImage) => {
    if (image.source === 'storage' && image.path) {
      let supabase: ReturnType<typeof createClient>
      try {
        supabase = createClient()
      } catch (clientError) {
        console.error('Supabase initialization failed:', clientError)
        toast.error('Unable to connect to Supabase to remove the image.')
        return
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          toast.error('Please log in to remove stored images.')
          return
        }

        const { error: removeError } = await supabase.storage
          .from('seed-images')
          .remove([image.path])

        if (removeError) {
          throw removeError
        }

        toast.success('Image removed from storage.')
      } catch (removeError) {
        console.error('Failed to remove image from storage:', removeError)
        toast.error('Could not remove image from storage. Please try again.')
        return
      }
    }

    setUploadedImages((prev) => prev.filter((item) => item.url !== image.url))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isUploadingImages) {
      setError('Please wait for image uploads to finish before submitting.')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to add seeds')
        setLoading(false)
        return
      }

      // Prepare seed data
      const seedData = {
        owner_id: user.id,
        common_name: formData.get('commonName') as string,
        variety: formData.get('variety') as string,
        scientific_name: formData.get('scientificName') as string || null,
        category: formData.get('category') as string,
        origin: formData.get('origin') as string,
        harvest_year: parseInt(formData.get('harvestYear') as string),
        germination_rate: parseFloat(formData.get('germinationRate') as string) || null,
        purity: parseFloat(formData.get('purity') as string) || null,
        treatment: formData.get('treatment') as string || null,
        quantity: parseFloat(formData.get('quantity') as string),
        unit: formData.get('unit') as string,
        description: formData.get('description') as string || null,
        is_organic: formData.get('isOrganic') === 'true',
        is_heirloom: formData.get('isHeirloom') === 'true',
        tags: [],
        images: uploadedImages.map((image) => image.url),
        status: 'available',
      }

      if (!seedData.images.length) {
        toast.info('Consider adding seed images to improve trust with the community.')
      }

      // Insert seed into database
      const { data: seed, error: insertError } = await supabase
        .from('seeds')
        .insert(seedData as any)
        .select()
        .single()

      if (insertError) throw insertError

      // Generate and upload QR code
      try {
        await createSeedQRCode(supabase, (seed as any).id, {
          common_name: seedData.common_name,
          variety: seedData.variety,
          owner_id: user.id,
        })
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError)
        // Continue even if QR generation fails
      }

      // Award points for adding seed
      await supabase.from('gamification').insert({
        user_id: user.id,
        action_type: 'seed_added',
        points_earned: 10,
        description: `Added seed: ${seedData.common_name}`,
      } as any)

      // Redirect to seed detail page
      router.push(`/library/${(seed as any).id}`)
    } catch (err: any) {
      console.error('Error adding seed:', err)
      setError(err.message || 'Failed to add seed')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="container mx-auto px-4 max-w-3xl py-12">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold text-foreground mb-2">Add Seeds to Library</h1>
          <p className="text-muted-foreground">
            Share your seeds with the community and earn 10 points!
          </p>
        </div>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Leaf className="mr-2 h-6 w-6 text-green-600 dark:text-green-400" />
              Seed Information
            </CardTitle>
            <CardDescription>
              Fill in the details about the seeds you want to share
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                
                <div>
                  <Label htmlFor="commonName">Common Name *</Label>
                  <Input
                    id="commonName"
                    name="commonName"
                    placeholder="e.g., Tomato, Basil, Marigold"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="variety">Variety *</Label>
                  <Input
                    id="variety"
                    name="variety"
                    placeholder="e.g., Cherry, Sweet, Hybrid"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scientificName">Scientific Name (Optional)</Label>
                  <Input
                    id="scientificName"
                    name="scientificName"
                    placeholder="e.g., Solanum lycopersicum"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Origin & Quality */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Origin & Quality</h3>
                
                <div>
                  <Label htmlFor="origin">Origin/Location *</Label>
                  <Input
                    id="origin"
                    name="origin"
                    placeholder="e.g., Maharashtra, Karnataka"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="harvestYear">Harvest Year *</Label>
                    <Input
                      id="harvestYear"
                      name="harvestYear"
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      placeholder="2024"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="germinationRate">Germination Rate (%)</Label>
                    <Input
                      id="germinationRate"
                      name="germinationRate"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purity">Purity (%)</Label>
                    <Input
                      id="purity"
                      name="purity"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="95"
                    />
                  </div>

                  <div>
                    <Label htmlFor="treatment">Treatment</Label>
                    <Input
                      id="treatment"
                      name="treatment"
                      placeholder="e.g., Organic, Untreated"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quantity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unit *</Label>
                    <Select name="unit" defaultValue="grams" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="seeds">Seeds (count)</SelectItem>
                        <SelectItem value="packets">Packets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us more about these seeds - growing tips, special characteristics, etc."
                  rows={4}
                />
              </div>

              {/* Characteristics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Characteristics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isOrganic">Is Organic?</Label>
                    <Select name="isOrganic" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="isHeirloom">Is Heirloom?</Label>
                    <Select name="isHeirloom" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Seed Images</h3>
                <p className="text-sm text-muted-foreground">
                  Upload clear photos of your seeds or packaging (max 5 images, up to 5MB each).
                </p>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                    isDragging ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-muted'
                  )}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    setIsDragging(false)
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    setIsDragging(false)
                    const files = Array.from(event.dataTransfer?.files || [])
                    void handleFilesUpload(files)
                  }}
                >
                  <div className="flex flex-col items-center">
                    {isUploadingImages ? (
                      <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
                    ) : (
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    )}
                    <p className="text-sm text-muted-foreground mb-2">
                      {isUploadingImages ? 'Uploading images...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedImages.length} / 5 images added
                    </p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploadingImages}
                    onChange={(event) => {
                      const files = Array.from(event.target.files || [])
                      void handleFilesUpload(files)
                    }}
                  />
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={image.path ?? `${image.url}-${index}`}
                        className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                      >
                        <Image
                          src={image.url}
                          alt={`Seed image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 120px"
                          unoptimized
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                          onClick={() => handleRemoveImage(image)}
                          aria-label={`Remove seed image ${index + 1}`}
                          disabled={isUploadingImages}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Seed...
                    </>
                  ) : (
                    'Add Seed to Library'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
