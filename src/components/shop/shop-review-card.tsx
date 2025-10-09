/**
 * Shop Review Card Component
 *
 * Displays a single shop review with ratings and user information.
 */

import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ShopReviewCardProps {
  review: {
    id: string;
    rating: number;
    shippingSpeedRating: number | null;
    communicationRating: number | null;
    itemAsDescribedRating: number | null;
    text: string | null;
    createdAt: Date;
    user: {
      name: string | null;
    } | null;
  };
}

export function ShopReviewCard({ review }: ShopReviewCardProps) {
  return (
    <div className="border-b pb-6 last:border-b-0">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'size-4',
                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
            <span className="text-muted-foreground ml-2 text-sm font-medium">
              {review.rating}.0
            </span>
          </div>
          <p className="text-sm font-medium">{review.user?.name || 'Anonymous'}</p>
        </div>
        <span className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Category Ratings */}
      {(review.shippingSpeedRating ||
        review.communicationRating ||
        review.itemAsDescribedRating) && (
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {review.shippingSpeedRating !== null && (
            <div className="text-muted-foreground">
              Shipping:{' '}
              <span className="text-foreground font-medium">{review.shippingSpeedRating}/5</span>
            </div>
          )}
          {review.communicationRating !== null && (
            <div className="text-muted-foreground">
              Communication:{' '}
              <span className="text-foreground font-medium">{review.communicationRating}/5</span>
            </div>
          )}
          {review.itemAsDescribedRating !== null && (
            <div className="text-muted-foreground">
              As Described:{' '}
              <span className="text-foreground font-medium">{review.itemAsDescribedRating}/5</span>
            </div>
          )}
        </div>
      )}

      {/* Review Text */}
      {review.text && <p className="text-muted-foreground leading-relaxed">{review.text}</p>}
    </div>
  );
}
