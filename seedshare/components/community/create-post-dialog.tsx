'use client'

import { useState } from 'react'
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
import { Plus, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const communities = [
  { name: 'Seed Saving Tips', slug: 'seed-saving-tips', icon: '🌱' },
  { name: 'Urban Farming', slug: 'urban-farming', icon: '🏙️' },
  { name: 'Seed Market Watch', slug: 'seed-market-watch', icon: '🔍' },
  { name: 'Seed Science', slug: 'seed-science', icon: '🔬' },
  { name: 'Indigenous Seeds', slug: 'indigenous-seeds', icon: '🌾' },
  { name: 'Organic Gardening', slug: 'organic-gardening', icon: '🌿' },
  { name: 'Permaculture', slug: 'permaculture', icon: '🌳' },
  { name: 'Seed Exchange', slug: 'seed-exchange', icon: '🤝' },
]

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

export function CreatePostDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = () => {
    // Handle post creation
    console.log({
      title,
      content,
      community: selectedCommunity,
      tags: selectedTags,
      images,
    })
    
    // Reset and close
    setTitle('')
    setContent('')
    setSelectedCommunity('')
    setSelectedTags([])
    setImages([])
    setOpen(false)
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
          {/* Community Selection */}
          <div className="space-y-2">
            <Label htmlFor="community">Choose a community *</Label>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger id="community">
                <SelectValue placeholder="Select a community..." />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.slug} value={community.slug}>
                    <div className="flex items-center gap-2">
                      <span>{community.icon}</span>
                      <span>c/{community.slug}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label>Images (optional)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Mock image upload
                  if (images.length < 4) {
                    setImages([...images, `/placeholder-${images.length + 1}.jpg`])
                  }
                }}
              >
                <ImageIcon className="h-4 w-4" />
                Add Image
              </Button>
              <Button type="button" variant="outline" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Add Link
              </Button>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-20 bg-gray-100 rounded border flex items-center justify-center"
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !selectedCommunity}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
