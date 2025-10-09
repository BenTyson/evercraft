/**
 * Shop Review Stats Component
 *
 * Displays overall review statistics and rating breakdown for a shop.
 */

'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageShippingSpeed: number;
  averageCommunication: number;
  averageItemAsDescribed: number;
}

export function ShopReviewStats({
  averageRating,
  totalReviews,
  distribution,
  averageShippingSpeed,
  averageCommunication,
  averageItemAsDescribed,
}: ShopReviewStatsProps) {
  // Calculate percentage for each rating
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Overall Rating */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Overall Rating</h3>
        <div className="mb-6 flex items-end gap-4">
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <div className="mb-1 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-5',
                    i < Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <div className="text-muted-foreground text-sm">{totalReviews} reviews</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex w-8 items-center gap-0.5 text-sm">
                <span>{rating}</span>
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className="bg-forest absolute top-0 left-0 h-full transition-all"
                  style={{
                    width: `${getPercentage(distribution[rating as 1 | 2 | 3 | 4 | 5])}%`,
                  }}
                />
              </div>
              <div className="text-muted-foreground w-12 text-sm">
                {getPercentage(distribution[rating as 1 | 2 | 3 | 4 | 5])}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Ratings */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Category Ratings</h3>
        <div className="space-y-4">
          <RatingBar label="Shipping Speed" rating={averageShippingSpeed} />
          <RatingBar label="Communication" rating={averageCommunication} />
          <RatingBar label="Item as Described" rating={averageItemAsDescribed} />
        </div>
      </div>
    </div>
  );
}

function RatingBar({ label, rating }: { label: string; rating: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-sm">{rating.toFixed(1)} / 5.0</span>
      </div>
      <div className="bg-muted relative h-2 overflow-hidden rounded-full">
        <div
          className="bg-eco-dark absolute top-0 left-0 h-full transition-all"
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
