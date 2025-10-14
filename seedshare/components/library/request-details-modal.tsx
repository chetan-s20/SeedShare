'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Loader2, 
  MessageSquare, 
  Package,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

interface RequestDetailsModalProps {
  request: any;
  type: 'sent' | 'received';
}

export function RequestDetailsModal({ request, type }: RequestDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const updateData: any = {
        status: 'approved',
        response_message: responseMessage || 'Your request has been approved!',
      };
      
      const { error } = await supabase
        .from('seed_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      // Award points for approving request
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('gamification').insert({
          user_id: user.id,
          action_type: 'request_approved',
          points_earned: 10,
          description: `Approved seed request for ${request.seed?.common_name}`,
        } as any);
      }

      toast.success('Request approved successfully!');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const updateData: any = {
        status: 'rejected',
        response_message: responseMessage || 'Unfortunately, your request cannot be fulfilled at this time.',
      };
      
      const { error } = await supabase
        .from('seed_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Request rejected');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const updateData: any = {
        status: 'completed',
        response_message: responseMessage || 'Exchange completed successfully!',
      };
      
      const { error } = await supabase
        .from('seed_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      // Award points for completing exchange
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('gamification').insert({
          user_id: user.id,
          action_type: 'exchange_completed',
          points_earned: 15,
          description: `Completed seed exchange for ${request.seed?.common_name}`,
        } as any);
      }

      toast.success('Exchange marked as completed!');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error marking as completed:', error);
      toast.error(error.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('seed_requests')
        .delete()
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Request cancelled');
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast.error(error.message || 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1">
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Request Details</DialogTitle>
          <DialogDescription>
            {type === 'sent' 
              ? 'View your seed request details and status'
              : 'Manage the seed request you received'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Status</h3>
            <Badge className={`${getStatusColor(request.status)} text-sm px-4 py-1 border`}>
              {request.status.toUpperCase()}
            </Badge>
          </div>

          <Separator />

          {/* Seed Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Seed Information
            </h3>
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                  {request.seed?.image_url ? (
                    request.seed.image_url.startsWith('data:') ? (
                      <img 
                        src={request.seed.image_url} 
                        alt={request.seed.common_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={request.seed.image_url}
                        alt={request.seed.common_name}
                        fill
                        className="object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">{request.seed?.common_name}</h4>
                {request.seed?.scientific_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                    {request.seed.scientific_name}
                  </p>
                )}
                {request.seed?.variety && (
                  <p className="text-sm mb-1">
                    <span className="font-medium">Variety:</span> {request.seed.variety}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Available:</span> {request.seed?.quantity_available || 'N/A'} units
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Request Details
            </h3>
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Quantity Requested:</span>
                <span>{request.quantity_requested} units</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Date Requested:</span>
                <span>{new Date(request.created_at).toLocaleString()}</span>
              </div>

              {type === 'sent' && request.seed?.owner && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Seed Owner:</span>
                  <span>{request.seed.owner.full_name || request.seed.owner.email}</span>
                </div>
              )}

              {type === 'received' && request.requester && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Requester:</span>
                    <span>{request.requester.full_name || request.requester.email}</span>
                  </div>
                  {request.requester.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Location:</span>
                      <span>{request.requester.city}, {request.requester.state}</span>
                    </div>
                  )}
                </>
              )}

              {request.message && (
                <div className="mt-3 pt-3 border-t dark:border-gray-700">
                  <p className="font-medium text-sm mb-2">Message from {type === 'sent' ? 'you' : 'requester'}:</p>
                  <p className="text-sm p-3 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                    {request.message}
                  </p>
                </div>
              )}

              {request.response_message && (
                <div className="mt-3 pt-3 border-t dark:border-gray-700">
                  <p className="font-medium text-sm mb-2">
                    Response from {type === 'sent' ? 'owner' : 'you'}:
                  </p>
                  <p className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    {request.response_message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions for received requests */}
          {type === 'received' && request.status === 'pending' && (
            <>
              <Separator />
              <div>
                <Label htmlFor="response" className="text-base font-semibold mb-2 block">
                  Response Message (Optional)
                </Label>
                <Textarea
                  id="response"
                  placeholder="Add a message to your response..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="mb-4"
                />
              </div>
            </>
          )}

          {/* Mark as completed for approved requests */}
          {type === 'received' && request.status === 'approved' && (
            <>
              <Separator />
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm mb-3">
                  Has the seed exchange been completed? Mark it as complete to finalize the transaction.
                </p>
                <Label htmlFor="completion-message" className="text-sm font-medium mb-2 block">
                  Completion Message (Optional)
                </Label>
                <Textarea
                  id="completion-message"
                  placeholder="Add any final notes about the exchange..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={2}
                  className="mb-2"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Actions for sent requests */}
          {type === 'sent' && request.status === 'pending' && (
            <Button
              variant="destructive"
              onClick={handleCancelRequest}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Request
                </>
              )}
            </Button>
          )}

          {/* Actions for received requests */}
          {type === 'received' && request.status === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={loading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}

          {/* Mark as completed button */}
          {type === 'received' && request.status === 'approved' && (
            <Button
              onClick={handleMarkCompleted}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Completed
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
