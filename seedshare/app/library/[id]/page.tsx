import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Leaf, 
  MapPin, 
  Calendar, 
  Gauge, 
  Droplet, 
  Package,
  User,
  Award,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import RequestSeedButton from '@/components/library/request-seed-button';

export default async function SeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch seed with owner profile
  const { data: seed, error } = await supabase
    .from('seeds')
    .select(`
      *,
      owner:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error || !seed) {
    notFound();
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  const seedData = seed as any;
  const owner = seedData.owner as any;
  const isOwner = user?.id === seedData.owner_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seed Image & Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {seedData.common_name} - {seedData.variety}
                    </CardTitle>
                    {seedData.scientific_name && (
                      <p className="text-gray-600 dark:text-gray-400 italic">{seedData.scientific_name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {seedData.is_organic && (
                      <Badge variant="default" className="bg-green-600">
                        Organic
                      </Badge>
                    )}
                    {seedData.is_heirloom && (
                      <Badge variant="secondary">
                        Heirloom
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {seedData.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center relative">
                  {seedData.images && seedData.images.length > 0 ? (
                    <Image 
                      src={seedData.images[0]} 
                      alt={seedData.common_name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  ) : (
                    <Leaf className="h-24 w-24 text-gray-400" />
                  )}
                </div>

                {/* Description */}
                {seedData.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300">{seedData.description}</p>
                  </div>
                )}

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Origin</p>
                      <p className="font-medium dark:text-gray-200">{seedData.origin}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Harvest Year</p>
                      <p className="font-medium dark:text-gray-200">{seedData.harvest_year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-medium dark:text-gray-200">
                        {seedData.quantity} {seedData.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium dark:text-gray-200">{seedData.category}</p>
                    </div>
                  </div>

                  {seedData.germination_rate && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Germination</p>
                        <p className="font-medium dark:text-gray-200">{seedData.germination_rate}%</p>
                      </div>
                    </div>
                  )}

                  {seedData.purity && (
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Purity</p>
                        <p className="font-medium dark:text-gray-200">{seedData.purity}%</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Treatment */}
                {seedData.treatment && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Treatment</p>
                    <p className="font-medium dark:text-gray-200">{seedData.treatment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Added on</p>
                    <p className="font-medium dark:text-gray-200">
                      {new Date(seedData.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
                    <p className="font-medium dark:text-gray-200">
                      {new Date(seedData.updated_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Seed Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {owner?.full_name?.[0] || owner?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold dark:text-white">{owner?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {owner?.location || 'Location not specified'}
                    </p>
                  </div>
                </div>

                {owner?.bio && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{owner.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    <span className="font-medium dark:text-gray-200">{owner?.points || 0}</span>
                    <span className="text-gray-600 dark:text-gray-400">points</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {!isOwner ? (
                    <>
                      <RequestSeedButton seedId={id} seedName={seedData.common_name} />
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/messages/${owner?.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/library/${id}/edit`}>
                        Edit Seed
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            {seedData.qr_code_url && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center relative">
                    <Image 
                      src={seedData.qr_code_url} 
                      alt="Seed QR Code"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 33vw, 25vw"
                    />
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant={
                      seedData.status === 'available' ? 'default' : 
                      seedData.status === 'reserved' ? 'secondary' : 
                      'outline'
                    }>
                      {seedData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity</span>
                    <span className="font-medium dark:text-gray-200">
                      {seedData.quantity} {seedData.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
