import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, Leaf, PackageSearch, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { RequestDetailsModal } from '@/components/library/request-details-modal';

export default async function MyRequestsPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your seed requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch user's sent requests
  const { data: sentRequests, error: sentError } = await supabase
    .from('seed_requests')
    .select(`
      *,
      seed:seeds(
        id,
        common_name,
        scientific_name,
        variety,
        image_url,
        quantity_available,
        owner:profiles(full_name, email, city, state)
      )
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch requests received (for seeds user owns)
  const { data: receivedRequests, error: receivedError } = await supabase
    .from('seed_requests')
    .select(`
      *,
      requester:profiles(full_name, email, city, state),
      seed:seeds!inner(
        id,
        common_name,
        scientific_name,
        variety,
        image_url,
        quantity_available
      )
    `)
    .eq('seed.owner_id', user.id)
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-gray-800 dark:to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <Link href="/library" className="text-green-100 hover:text-white mb-2 inline-flex items-center gap-2">
              ← Back to Seed Library
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My Seed Requests
            </h1>
            <p className="text-xl text-green-50 dark:text-gray-300">
              Manage your seed exchange requests and respond to requests from others
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Sent Requests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold">Requests I've Made</h2>
              <Badge variant="secondary" className="ml-auto">
                {sentRequests?.length || 0}
              </Badge>
            </div>

            <div className="space-y-4">
              {sentRequests && sentRequests.length > 0 ? (
                sentRequests.map((request: any) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Seed Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
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
                                <Leaf className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">
                                {request.seed?.common_name || 'Unknown Seed'}
                              </h3>
                              {request.seed?.variety && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {request.seed.variety}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              <span className="font-medium">Quantity:</span> {request.quantity_requested} units
                            </p>
                            <p>
                              <span className="font-medium">Owner:</span>{' '}
                              {request.seed?.owner?.full_name || request.seed?.owner?.email || 'Unknown'}
                            </p>
                            <p>
                              <span className="font-medium">Requested:</span>{' '}
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {request.message && (
                            <p className="text-sm mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="font-medium">Message:</span> {request.message}
                            </p>
                          )}

                          {request.response_message && (
                            <p className="text-sm mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                              <span className="font-medium">Response:</span> {request.response_message}
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <RequestDetailsModal request={request} type="sent" />
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/library/${request.seed?.id}`}>
                                View Seed
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <PackageSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't made any seed requests yet. Browse the seed library to find seeds you're interested in.
                    </p>
                    <Button asChild>
                      <Link href="/library">
                        Browse Seeds
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Received Requests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Inbox className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold">Requests I've Received</h2>
              <Badge variant="secondary" className="ml-auto">
                {receivedRequests?.length || 0}
              </Badge>
            </div>

            <div className="space-y-4">
              {receivedRequests && receivedRequests.length > 0 ? (
                receivedRequests.map((request: any) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Seed Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
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
                                <Leaf className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Request Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">
                                {request.seed?.common_name || 'Unknown Seed'}
                              </h3>
                              {request.seed?.variety && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {request.seed.variety}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              <span className="font-medium">Quantity:</span> {request.quantity_requested} units
                            </p>
                            <p>
                              <span className="font-medium">From:</span>{' '}
                              {request.requester?.full_name || request.requester?.email || 'Unknown'}
                            </p>
                            {request.requester?.city && (
                              <p>
                                <span className="font-medium">Location:</span>{' '}
                                {request.requester.city}, {request.requester.state}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Requested:</span>{' '}
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {request.message && (
                            <p className="text-sm mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="font-medium">Message:</span> {request.message}
                            </p>
                          )}

                          {request.response_message && (
                            <p className="text-sm mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                              <span className="font-medium">Your Response:</span> {request.response_message}
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <RequestDetailsModal request={request} type="received" />
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/library/${request.seed?.id}`}>
                                View Seed
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Inbox className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Requests Received</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't received any seed requests yet. Add your seeds to the library to start receiving requests.
                    </p>
                    <Button asChild>
                      <Link href="/library/add">
                        Add Your Seeds
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
