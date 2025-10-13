import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Leaf, Plus, Search, Filter, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function SeedLibraryPage() {
  const supabase = await createClient();
  
  // Fetch seeds from database
  const { data: seeds, error } = await supabase
    .from('seeds')
    .select(`
      *,
      owner:profiles(full_name, city, state)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-gray-800 dark:to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Seed Library
            </h1>
            <p className="text-xl text-green-50 dark:text-gray-300 mb-6">
              Browse and exchange seeds with fellow farmers and gardeners. Build a resilient, diverse seed collection.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 dark:bg-green-700 dark:text-white dark:hover:bg-green-600" asChild>
                <Link href="/library/add">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your Seeds
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 dark:border-gray-600 dark:hover:bg-gray-800" asChild>
                <Link href="/library/requests">
                  My Requests
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 -mt-8">
        <Card className="shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search seeds by name, variety, or category..."
                  className="pl-10 h-12"
                />
              </div>
              <Button variant="outline" className="h-12">
                <Filter className="mr-2 h-5 w-5" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seeds Grid */}
      <div className="container mx-auto px-4 py-12">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">Error loading seeds: {error.message}</p>
            </CardContent>
          </Card>
        ) : !seeds || seeds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No seeds available yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to add seeds to the library!
              </p>
              <Button asChild>
                <Link href="/library/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Seeds
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Seeds ({seeds.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seeds.map((seed: any) => (
                <Card key={seed.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-800 dark:to-gray-700 relative">
                    {seed.images && seed.images[0] ? (
                      <Image
                        src={seed.images[0]}
                        alt={seed.common_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Leaf className="h-16 w-16 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {seed.is_organic && (
                        <Badge className="bg-green-600 dark:bg-green-700">Organic</Badge>
                      )}
                      {seed.is_heirloom && (
                        <Badge className="bg-amber-600 dark:bg-amber-700">Heirloom</Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{seed.common_name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {seed.variety}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {seed.owner?.city || seed.origin}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="outline">{seed.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{seed.quantity} {seed.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/library/${seed.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
