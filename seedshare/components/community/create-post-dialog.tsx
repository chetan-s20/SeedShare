'use client'

import { useState, useRef, useCallback, ChangeEvent } from 'react'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Plus, Image as ImageIcon, Link as LinkIcon, X, Loader2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createPost } from '@/app/community/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const popularTags = [
  'heirloom',
  'organic',
  'urban-farming',
  'seed-saving',
  'germination',
  'conservation',
  'marketplace',
  'success-story',
  'question',
  'help-needed',
]

// Types for image upload
type UploadedImage = {
  path: string | null
  url: string
  source: 'storage' | 'inline'
}

// Helper functions for file handling
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const shouldFallbackToInlineStorage = (error: any): boolean => {
  // Check for common bucket not found or permission denied errors
  const errorMessage = error?.message?.toLowerCase() || ''
  return (
    errorMessage.includes('not found') ||
    errorMessage.includes('does not exist') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('bucket') ||
    errorMessage.includes('storage')
  )
}

interface CreatePostDialogProps {
  communityId?: string
}

export function CreatePostDialog({ communityId }: CreatePostDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Link handling
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleFilesUpload = async (files: File[]) => {
    if (!files.length) return

    const remainingSlots = 4 - uploadedImages.length
    if (remainingSlots <= 0) {
      toast.error('You can upload up to 4 images per post.')
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
          const filePath = `${userId}/community-${uniqueToken}-${sanitizedBaseName}.${extension}`

          try {
            const { error: uploadError } = await supabase.storage
              .from('community-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'image/jpeg'
              })

            if (uploadError) {
              throw uploadError
            }

            const { data: publicUrlData } = supabase.storage
              .from('community-images')
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
              toast.warning('Cannot upload to Supabase bucket "community-images" (missing or permission denied). Using inline images until storage is configured.')
              bucketMissingWarned = true
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
          } catch (fileReadError) {
            console.error('Failed to convert file to data URL:', fileReadError)
            failedFiles.push(file.name)
          }
        }
      }

      if (uploads.length) {
        setUploadedImages((prev) => [...prev, ...uploads])
        // Update the images array for the createPost function
        setImages((prev) => [...prev, ...uploads.map(img => img.url)])
        toast.success(`${uploads.length} image${uploads.length > 1 ? 's' : ''} ready.`)
      }

      if (inlineFallbackCount > 0) {
        toast.warning('Some images are stored inline. Configure the "community-images" bucket in Supabase for optimal performance.')
      }

      if (failedFiles.length > 0) {
        toast.error(`Could not process: ${failedFiles.join(', ')}`)
      }
    } catch (error) {
      console.error('Error processing images:', error)
      toast.error('Failed to process image uploads.')
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(Array.from(e.target.files))
    }
  }
  
  const handleRemoveImage = async (image: UploadedImage) => {
    // Remove from the UI immediately
    setUploadedImages((prev) => prev.filter(item => item.url !== image.url))
    setImages((prev) => prev.filter(url => url !== image.url))
    
    // If it's stored in Supabase, attempt to delete it
    if (image.source === 'storage' && image.path) {
      try {
        const supabase = createClient()
        await supabase.storage
          .from('community-images')
          .remove([image.path])
      } catch (error) {
        console.error('Failed to delete image from storage:', error)
      }
    }
    
    toast.success('Image removed')
  }
  
  // Drag and drop handlers
  const [isDragging, setIsDragging] = useState(false)
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUploadingImages && uploadedImages.length < 4) {
      setIsDragging(true)
    }
  }, [isUploadingImages, uploadedImages.length])
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (isUploadingImages || uploadedImages.length >= 4) return
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(Array.from(e.dataTransfer.files))
    }
  }, [isUploadingImages, uploadedImages.length])
  
  const handleAddLink = () => {
    if (!linkUrl) {
      toast.error('Please enter a valid URL')
      return
    }
    
    try {
      // Basic URL validation
      new URL(linkUrl)
      
      // Add link to form data
      setImages(prev => [...prev, linkUrl])
      setLinkUrl('')
      setShowLinkInput(false)
      toast.success('Link added successfully')
    } catch (error) {
      toast.error('Please enter a valid URL with http:// or https://')
    }
  }

  const handleSubmit = async () => {
    if (!title || !content) {
      setError('Title and content are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Get all image URLs from uploaded images
      const imageUrls = uploadedImages.map(img => img.url)
      
      const result = await createPost({
        title,
        content,
        communityId: communityId || undefined,
        tags: selectedTags,
        images: imageUrls,
        linkUrl: linkUrl || undefined,
      })

      if (result.success) {
        // Reset and close
        setTitle('')
        setContent('')
        setSelectedCommunity('')
        setSelectedTags([])
        setUploadedImages([])
        setImages([])
        setLinkUrl('')
        setShowLinkInput(false)
        setOpen(false)
        
        // Refresh the page to show new post
        router.refresh()
        toast.success('Post created successfully!')
      } else {
        setError(result.error || 'Failed to create post')
      }
    } catch (err) {
      console.error('Error creating post:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share your knowledge, ask questions, or start a discussion with the community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Community indicator (if posting to specific community) */}
          {communityId && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">Posting to this community</p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Give your post an interesting title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
            />
            <p className="text-xs text-gray-500">{title.length}/300 characters</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, experiences, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={10000}
            />
            <p className="text-xs text-gray-500">{content.length}/10,000 characters</p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (select up to 5)</Label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-gray-200"
                  onClick={() => handleTagToggle(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-gray-600">Selected:</span>
                {selectedTags.map((tag) => (
                  <Badge key={tag} className="gap-1">
                    #{tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Images (optional, up to 4)</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploadingImages ? (
                <div className="flex flex-col items-center text-gray-600">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                  <p>Uploading images...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <Upload className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium mb-1">
                    {uploadedImages.length >= 4
                      ? 'Maximum number of images reached'
                      : 'Drag & drop images here'}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {uploadedImages.length >= 4
                      ? 'Remove an image to add more'
                      : 'PNG, JPG or GIF up to 5MB'}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImages || uploadedImages.length >= 4}
                  >
                    Select Files
                  </Button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                disabled={isUploadingImages || uploadedImages.length >= 4}
              />
            </div>
            
            {/* Add Link UI */}
            <div className="flex items-end gap-2 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={() => setShowLinkInput(!showLinkInput)}
              >
                <LinkIcon className="h-4 w-4" />
                {showLinkInput ? 'Hide' : 'Add Link'}
              </Button>
              
              {showLinkInput && (
                <>
                  <div className="flex-1">
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="flex-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a URL to an external resource</p>
                  </div>
                  <Button 
                    type="button"
                    size="sm"
                    onClick={handleAddLink}
                  >
                    Add
                  </Button>
                </>
              )}
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-24 bg-gray-100 rounded border overflow-hidden"
                  >
                    {image.source === 'storage' ? (
                      <NextImage 
                        src={image.url} 
                        alt={`Community post image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={image.url} 
                          alt={`Post image ${index + 1}`} 
                          className="max-h-full max-w-full"
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-90 hover:opacity-100"
                      onClick={() => handleRemoveImage(image)}
                      disabled={isUploadingImages}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Posting Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <p className="font-semibold text-blue-900 mb-1">Posting Guidelines:</p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>Be respectful and constructive</li>
              <li>Stay on topic and relevant to the community</li>
              <li>Verify information before sharing</li>
              <li>Credit sources when sharing others' content</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !content || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}