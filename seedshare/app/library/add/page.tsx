'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Leaf } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createSeedQRCode } from '@/lib/qr-utils';

export default function AddSeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Flowers',
    'Grains',
    'Legumes',
    'Other'
  ];

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
        setError('You must be logged in to add seeds');
        setLoading(false);
        return;
      }

      // Prepare seed data
      const seedData = {
        owner_id: user.id,
        common_name: formData.get('commonName') as string,
        variety: formData.get('variety') as string,
        scientific_name: formData.get('scientificName') as string || null,
        category: formData.get('category') as string,
        origin: formData.get('origin') as string,
        harvest_year: parseInt(formData.get('harvestYear') as string),
        germination_rate: parseFloat(formData.get('germinationRate') as string) || null,
        purity: parseFloat(formData.get('purity') as string) || null,
        treatment: formData.get('treatment') as string || null,
        quantity: parseFloat(formData.get('quantity') as string),
        unit: formData.get('unit') as string,
        description: formData.get('description') as string || null,
        is_organic: formData.get('isOrganic') === 'true',
        is_heirloom: formData.get('isHeirloom') === 'true',
        tags: [],
        images: [],
        status: 'available',
      };

      // Insert seed into database
      const { data: seed, error: insertError } = await supabase
        .from('seeds')
        .insert(seedData as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate and upload QR code
      try {
        await createSeedQRCode(supabase, (seed as any).id, {
          common_name: seedData.common_name,
          variety: seedData.variety,
          owner_id: user.id,
        });
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
        // Continue even if QR generation fails
      }

      // Award points for adding seed
      await supabase.from('gamification').insert({
        user_id: user.id,
        action_type: 'seed_added',
        points_earned: 10,
        description: `Added seed: ${seedData.common_name}`,
      } as any);

      // Redirect to seed detail page
      router.push(`/library/${(seed as any).id}`);
    } catch (err: any) {
      console.error('Error adding seed:', err);
      setError(err.message || 'Failed to add seed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add Seeds to Library</h1>
          <p className="text-gray-600">
            Share your seeds with the community and earn 10 points!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="mr-2 h-6 w-6 text-green-600" />
              Seed Information
            </CardTitle>
            <CardDescription>
              Fill in the details about the seeds you want to share
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                
                <div>
                  <Label htmlFor="commonName">Common Name *</Label>
                  <Input
                    id="commonName"
                    name="commonName"
                    placeholder="e.g., Tomato, Basil, Marigold"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="variety">Variety *</Label>
                  <Input
                    id="variety"
                    name="variety"
                    placeholder="e.g., Cherry, Sweet, Hybrid"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="scientificName">Scientific Name (Optional)</Label>
                  <Input
                    id="scientificName"
                    name="scientificName"
                    placeholder="e.g., Solanum lycopersicum"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Origin & Quality */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Origin & Quality</h3>
                
                <div>
                  <Label htmlFor="origin">Origin/Location *</Label>
                  <Input
                    id="origin"
                    name="origin"
                    placeholder="e.g., Maharashtra, Karnataka"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="harvestYear">Harvest Year *</Label>
                    <Input
                      id="harvestYear"
                      name="harvestYear"
                      type="number"
                      min="2000"
                      max={new Date().getFullYear()}
                      placeholder="2024"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="germinationRate">Germination Rate (%)</Label>
                    <Input
                      id="germinationRate"
                      name="germinationRate"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purity">Purity (%)</Label>
                    <Input
                      id="purity"
                      name="purity"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="95"
                    />
                  </div>

                  <div>
                    <Label htmlFor="treatment">Treatment</Label>
                    <Input
                      id="treatment"
                      name="treatment"
                      placeholder="e.g., Organic, Untreated"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quantity</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unit *</Label>
                    <Select name="unit" defaultValue="grams" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="seeds">Seeds (count)</SelectItem>
                        <SelectItem value="packets">Packets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us more about these seeds - growing tips, special characteristics, etc."
                  rows={4}
                />
              </div>

              {/* Characteristics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Characteristics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="isOrganic">Is Organic?</Label>
                    <Select name="isOrganic" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="isHeirloom">Is Heirloom?</Label>
                    <Select name="isHeirloom" defaultValue="false">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Seed...
                    </>
                  ) : (
                    'Add Seed to Library'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
