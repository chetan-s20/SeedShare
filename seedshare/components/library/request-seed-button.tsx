'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface RequestSeedButtonProps {
  seedId: string;
  seedName: string;
}

export default function RequestSeedButton({ seedId, seedName }: RequestSeedButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to request seeds');
        setLoading(false);
        return;
      }

      // Create seed request
      const requestData = {
        seed_id: seedId,
        requester_id: user.id,
        quantity_requested: parseFloat(formData.get('quantity') as string),
        message: formData.get('message') as string || null,
        status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('seed_requests')
        .insert(requestData as any);

      if (insertError) throw insertError;

      // Award points for requesting seed
      await supabase.from('gamification').insert({
        user_id: user.id,
        action_type: 'seed_requested',
        points_earned: 5,
        description: `Requested seed: ${seedName}`,
      } as any);

      setOpen(false);
      router.refresh();
      
      // Show success message (you can implement toast notification here)
      alert('Seed request sent successfully!');
    } catch (err: any) {
      console.error('Error requesting seed:', err);
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1">
          <Send className="mr-2 h-4 w-4" />
          Request Seeds
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Seeds</DialogTitle>
          <DialogDescription>
            Send a request to the seed owner. They will be notified and can accept or decline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="seedName">Seed</Label>
            <Input
              id="seedName"
              value={seedName}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity Requested</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Tell the owner why you need these seeds, or any special requests..."
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
