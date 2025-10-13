'use client'

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
import { Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { createCommunity } from '@/app/community/actions'
import { useRouter } from 'next/navigation'

export function CreateCommunityDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createCommunity({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      region: formData.get('region') as string,
      state: formData.get('state') as string,
      city: formData.get('city') as string,
    })

    setIsLoading(false)

    if (result.success && result.communityId) {
      setOpen(false)
      router.push(`/communities/${result.communityId}`)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
          <Plus className="h-4 w-4" />
          Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Community</DialogTitle>
            <DialogDescription>
              Start a new community for gardeners in your area to connect and share.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Community Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Bay Area Gardeners"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this community about?"
                required
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                name="region"
                placeholder="e.g., North America"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State/Province *</Label>
              <Input
                id="state"
                name="state"
                placeholder="e.g., California"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g., San Francisco"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Community'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
