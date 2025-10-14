'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Send, UserPlus, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export default function CreateGeneralRequestDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [taggedUserId, setTaggedUserId] = useState<string>('');
  const [seedDescription, setSeedDescription] = useState('');
  const router = useRouter();

  // Fetch available users to tag when dialog opens
  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch all users except current user
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .neq('id', user.id)
            .order('full_name', { ascending: true, nullsFirst: false });

          if (error) {
            console.error('Error fetching users:', error);
          }

          if (data) {
            console.log('Available users:', data.length);
            setUsers(data);
          }
        }
      };

      fetchUsers();
    }
  }, [open]);

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
        setError('You must be logged in to create a request');
        setLoading(false);
        return;
      }

      // Validate that a user is tagged (required for general requests)
      if (!taggedUserId) {
        setError('Please tag a user to direct your request');
        setLoading(false);
        return;
      }

      // Create a general seed request with null seed_id
      const requestData: any = {
        seed_id: null, // General request not tied to specific seed
        requester_id: user.id,
        quantity_requested: parseFloat(formData.get('quantity') as string) || 0,
        message: formData.get('message') as string || null,
        status: 'pending',
        tagged_user_id: taggedUserId, // Required for general requests
      };

      const { error: insertError } = await supabase
        .from('seed_requests')
        .insert(requestData);

      if (insertError) throw insertError;

      // Award points for making a request
      await supabase.from('gamification').insert({
        user_id: user.id,
        action_type: 'seed_requested',
        points_earned: 5,
        description: `Created general seed request`,
      } as any);

      setOpen(false);
      router.refresh();
      
      toast.success('Request sent successfully!');
      
      // Reset form
      setSeedDescription('');
      setTaggedUserId('');
    } catch (err: any) {
      console.error('Error creating request:', err);
      setError(err.message || 'Failed to create request');
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-xs">
          <Plus className="mr-2 h-4 w-4" />
          Create New Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Seed Request</DialogTitle>
          <DialogDescription>
            Tag a specific user to request seeds from them or ask for help finding seeds.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="seedDescription">What seeds are you looking for?</Label>
            <Input
              id="seedDescription"
              name="seedDescription"
              value={seedDescription}
              onChange={(e) => setSeedDescription(e.target.value)}
              placeholder="e.g., Tomato seeds, Basil, Organic vegetables..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what you're looking for
            </p>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity Needed</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter quantity (optional)"
              defaultValue=""
            />
            <p className="text-xs text-gray-500 mt-1">
              How much do you need? (optional)
            </p>
          </div>

          <div>
            <Label htmlFor="tagUser" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Tag a User (Required) *
            </Label>
            <Select value={taggedUserId || undefined} onValueChange={setTaggedUserId} required>
              <SelectTrigger id="tagUser" className="w-full">
                <SelectValue placeholder="Select a user to tag..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {users.length === 0 ? (
                  <SelectItem value="loading" disabled>
                    <span className="text-gray-400">Loading users...</span>
                  </SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.full_name || 'No Name'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {users.length > 0 ? (
                <>Found {users.length} user(s). Tag someone who might help.</>
              ) : (
                <>Loading users...</>
              )}
            </p>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Explain what you need and why you're reaching out to this user..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Include: "{seedDescription}" in your message
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !taggedUserId} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
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
