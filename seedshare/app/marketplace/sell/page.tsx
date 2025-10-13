'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Store, 
  Package, 
  IndianRupee, 
  Image as ImageIcon,
  Leaf,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { createMarketplaceProduct } from './actions'
import { createClient } from '@/lib/supabase/client'
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

function SellSeedPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    minimum_order: '1',
    seed_type: '',
    variety: '',
    is_organic: false,
    is_heirloom: false,
    is_hybrid: false,
    germination_rate: '',
    weight_per_pack: '',
    growing_season: '',
    sowing_method: '',
    harvest_time: '',
  })

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

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

  const handleFilesUpload = async (files: File[]) => {
    if (!files.length) return

    const remainingSlots = 5 - uploadedImages.length
    if (remainingSlots <= 0) {
      toast.error('You can upload up to 5 images per product.')
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
      toast.warning(`You can upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} only.`)
    }

    if (!validFiles.length) {
      setIsUploadingImages(false)
      return
    }

    let supabase = null as ReturnType<typeof createClient> | null
    try {
      supabase = createClient()
    } catch (clientError) {
      console.error('Supabase client initialization failed:', clientError)
      toast.warning('Supabase storage is not configured. Using inline images instead.')
    }

    let userId: string | null = null

    if (supabase) {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          toast.error('Please log in to upload images.')
          setIsUploadingImages(false)
          return
        }

        userId = user.id
      } catch (authCheckError) {
        console.error('Failed to verify Supabase user:', authCheckError)
        toast.error('Unable to verify your session. Please log in again.')
        setIsUploadingImages(false)
        return
      }
    }

    try {
      const uploads: UploadedImage[] = []
      const failedFiles: string[] = []
      let inlineFallbackCount = 0
      let bucketMissingWarned = false

      for (const file of validFiles) {
        let storedInSupabase = false

        if (supabase && userId) {
          const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const baseName = file.name.replace(/\.[^/.]+$/, '')
          const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'image'
          const uniqueToken = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2, 10)
          const filePath = `${userId}/product-${uniqueToken}-${sanitizedBaseName}.${extension}`

          try {
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'image/jpeg'
              })

            if (uploadError) {
              throw uploadError
            }

            const { data: publicUrlData } = supabase.storage
              .from('product-images')
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
            console.error('Image upload error:', uploadError)

            if (shouldFallbackToInlineStorage(uploadError) && !bucketMissingWarned) {
              toast.warning('Cannot upload to Supabase bucket "product-images" (missing or permission denied). Using inline images until storage is configured.')
              bucketMissingWarned = true
            }

            // fall back to inline image storage for this file
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
          } catch (fileReadError) {
            console.error('Failed to convert file to data URL:', fileReadError)
            failedFiles.push(file.name)
          }
        }
      }

      if (uploads.length) {
        setUploadedImages((prev) => [...prev, ...uploads])
        toast.success(`${uploads.length} image${uploads.length > 1 ? 's' : ''} ready.`)
      }

      if (inlineFallbackCount > 0) {
        toast.warning('Some images are stored inline. Configure the "product-images" bucket in Supabase (create it or adjust policies) for optimal performance.')
      }

      if (failedFiles.length > 0) {
        toast.error(`Could not process: ${failedFiles.join(', ')}`)
      }
    } catch (error) {
      console.error('Failed to process images:', error)
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
      let supabase: ReturnType<typeof createClient> | null = null
      try {
        supabase = createClient()
      } catch (clientError) {
        console.error('Supabase client initialization failed:', clientError)
        toast.error('Unable to connect to storage. Please check your configuration.')
        return
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          toast.error('Please log in to remove stored images.')
          return
        }

        const { error } = await supabase.storage
          .from('product-images')
          .remove([image.path])

        if (error) {
          throw error
        }

        setUploadedImages((prev) => prev.filter((item) => item.path !== image.path))
        toast.success('Image removed from storage.')
      } catch (error) {
        console.error('Failed to remove image from storage:', error)
        toast.error('Could not remove image from storage. Please try again.')
      }

      return
    }

    // Inline images can be removed locally without contacting Supabase
    setUploadedImages((prev) => prev.filter((item) => item.url !== image.url))
    toast.success('Image removed.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isUploadingImages) {
      toast.warning('Please wait for image uploads to finish before submitting.')
      return
    }

    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || !formData.stock_quantity || !formData.seed_type) {
        toast.error('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Prepare product data matching database schema
      const productData = {
        name: formData.title,
        variety: formData.variety || 'Standard',
        category: formData.seed_type, // Maps seed_type to category
        description: formData.description,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.stock_quantity),
        unit: formData.weight_per_pack || 'pack',
        min_order_quantity: parseInt(formData.minimum_order) || 1,
        germination_rate: formData.germination_rate ? parseFloat(formData.germination_rate) : undefined,
        images: uploadedImages.map((image) => image.url),
        tags: [
          formData.is_organic ? 'organic' : null,
          formData.is_heirloom ? 'heirloom' : null,
          formData.is_hybrid ? 'hybrid' : null,
          formData.growing_season || null,
        ].filter(Boolean) as string[]
      }

      console.log('Submitting product:', productData)

      // Call server action
      const result = await createMarketplaceProduct(productData)

      if (result.success) {
        toast.success(result.message || 'Product listed successfully!')
        router.push('/marketplace')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to list product')
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to list product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sell Your Seeds</h1>
              <p className="text-gray-600 dark:text-gray-400">
                List your seeds and reach thousands of farmers and gardeners
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide essential details about your seed product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Organic Tomato Seeds - Pusa Ruby"
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your seeds, their quality, benefits, and growing instructions..."
                  rows={4}
                  required
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seed_type">Seed Type *</Label>
                  <Select
                    value={formData.seed_type}
                    onValueChange={(value) => handleSelectChange('seed_type', value)}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetable">Vegetable</SelectItem>
                      <SelectItem value="fruit">Fruit</SelectItem>
                      <SelectItem value="herb">Herb</SelectItem>
                      <SelectItem value="flower">Flower</SelectItem>
                      <SelectItem value="grain">Grain</SelectItem>
                      <SelectItem value="spice">Spice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="variety">Variety</Label>
                  <Input
                    id="variety"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    placeholder="e.g., Pusa Ruby, Hybrid"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_organic"
                    checked={formData.is_organic}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Organic Certified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_heirloom"
                    checked={formData.is_heirloom}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Heirloom Variety</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_hybrid"
                    checked={formData.is_hybrid}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Hybrid</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Pricing & Stock
              </CardTitle>
              <CardDescription>
                Set your pricing and inventory details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="299"
                    required
                    min="0"
                    step="0.01"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    name="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    placeholder="399"
                    min="0"
                    step="0.01"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    For showing discounts
                  </p>
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                    min="1"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight_per_pack">Weight/Quantity per Pack *</Label>
                  <Input
                    id="weight_per_pack"
                    name="weight_per_pack"
                    value={formData.weight_per_pack}
                    onChange={handleInputChange}
                    placeholder="e.g., 50g, 100 seeds, 1kg"
                    required
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="minimum_order">Minimum Order Quantity</Label>
                  <Input
                    id="minimum_order"
                    name="minimum_order"
                    type="number"
                    value={formData.minimum_order}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Growing Information
              </CardTitle>
              <CardDescription>
                Help buyers understand how to grow these seeds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="germination_rate">Germination Rate (%)</Label>
                  <Input
                    id="germination_rate"
                    name="germination_rate"
                    type="number"
                    value={formData.germination_rate}
                    onChange={handleInputChange}
                    placeholder="85"
                    min="0"
                    max="100"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="growing_season">Growing Season</Label>
                  <Input
                    id="growing_season"
                    name="growing_season"
                    value={formData.growing_season}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer, Winter, All Year"
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sowing_method">Sowing Method</Label>
                <Textarea
                  id="sowing_method"
                  name="sowing_method"
                  value={formData.sowing_method}
                  onChange={handleInputChange}
                  placeholder="Describe how to sow these seeds..."
                  rows={3}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <Label htmlFor="harvest_time">Harvest Time</Label>
                <Input
                  id="harvest_time"
                  name="harvest_time"
                  value={formData.harvest_time}
                  onChange={handleInputChange}
                  placeholder="e.g., 60-70 days after sowing"
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
              </CardTitle>
              <CardDescription>
                Upload clear images of your seeds and packaging (Max 5 images)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'border-2 border-dashed dark:border-gray-700 rounded-lg p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
                  isDragging && 'border-green-500 bg-green-50 dark:bg-green-900/20'
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
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {isUploadingImages ? 'Uploading images...' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PNG, JPG, JPEG up to 5MB each
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {uploadedImages.length} / 5 images uploaded
                  </p>
                </div>
                <Input
                  ref={fileInputRef}
                  id="product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploadingImages}
                  className="hidden"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || [])
                    void handleFilesUpload(files)
                  }}
                />
              </div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={image.path ?? `${image.url}-${index}`}
                      className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700"
                    >
                      <Image
                        src={image.url}
                        alt={`Uploaded product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 120px"
                        unoptimized
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        onClick={() => handleRemoveImage(image)}
                        aria-label={`Remove image ${index + 1}`}
                        disabled={isUploadingImages}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to list your product?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Your product will be reviewed and published within 24 hours. Make sure all
                    information is accurate and complete.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      {isSubmitting ? 'Submitting...' : 'List Product'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(SellSeedPage), { ssr: false })
