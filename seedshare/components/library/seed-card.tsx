'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, MapPin } from 'lucide-react';

interface SeedCardProps {
  seed: {
    id: string;
    common_name: string;
    variety: string;
    category: string;
    origin: string;
    quantity: number;
    unit: string;
    is_organic: boolean;
    is_heirloom: boolean;
    images?: string[];
    owner?: {
      full_name?: string;
      city?: string;
      state?: string;
    };
  };
}

export default function SeedCard({ seed }: SeedCardProps) {
  return (
    <Link href={`/library/${seed.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <CardHeader className="pb-3">
          {/* Image */}
          <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {seed.images && seed.images.length > 0 ? (
              <img 
                src={seed.images[0]} 
                alt={seed.common_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Leaf className="h-16 w-16 text-green-600" />
            )}
          </div>

          {/* Title and Badges */}
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">
              {seed.common_name}
            </CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              {seed.is_organic && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Organic
                </Badge>
              )}
              {seed.is_heirloom && (
                <Badge variant="secondary" className="text-xs">
                  Heirloom
                </Badge>
              )}
            </div>
          </div>

          {/* Variety */}
          <CardDescription className="line-clamp-1">
            {seed.variety}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Location */}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {seed.owner?.city && seed.owner?.state 
                ? `${seed.owner.city}, ${seed.owner.state}`
                : seed.origin}
            </span>
          </div>

          {/* Category and Quantity */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{seed.category}</span>
            <Badge variant="outline" className="text-xs">
              {seed.quantity} {seed.unit}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
