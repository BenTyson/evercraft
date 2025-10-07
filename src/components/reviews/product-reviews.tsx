'use client';

import { useState, useEffect } from 'react';
import { StarRating } from './star-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  text: string | null;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  User: {
    name: string | null;
  } | null;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  initialReviews: Review[];
  initialStats: ReviewStats;
  initialTotalCount: number;
}

type SortOption = 'recent' | 'helpful' | 'rating_high' | 'rating_low';

export function ProductReviews({
  productId,
  initialReviews,
  initialStats,
  initialTotalCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [stats, setStats] = useState(initialStats);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  // Calculate rating percentage for distribution bars
  const getRatingPercentage = (count: number) => {
    if (stats.totalReviews === 0) return 0;
    return (count / stats.totalReviews) * 100;
  };

  // Load more reviews when filters change
  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/reviews?productId=${productId}&sortBy=${sortBy}&verifiedOnly=${verifiedOnly}&limit=${limit}&offset=${offset}`
        );
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
          setTotalCount(data.totalCount);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (offset > 0 || sortBy !== 'recent' || verifiedOnly !== false) {
      loadReviews();
    }
  }, [productId, sortBy, verifiedOnly, offset]);

  const hasMoreReviews = offset + limit < totalCount;

  const handleLoadMore = () => {
    setOffset(offset + limit);
  };

  if (stats.totalReviews === 0) {
    return (
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="mb-8 grid gap-8 md:grid-cols-2">
        {/* Average Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <StarRating rating={stats.averageRating} size="lg" />
            <p className="text-muted-foreground mt-2 text-sm">
              Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution];
            const percentage = getRatingPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-right font-medium">{rating} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-12">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortOption);
              setOffset(0);
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => {
              setVerifiedOnly(e.target.checked);
              setOffset(0);
            }}
            className="rounded border-gray-300"
          />
          <span>Verified purchases only</span>
        </label>

        <div className="text-muted-foreground ml-auto text-sm">
          Showing {reviews.length} of {totalCount} review{totalCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Reviews List */}
      {isLoading && offset === 0 ? (
        <div className="py-12 text-center">
          <div className="text-muted-foreground">Loading reviews...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {hasMoreReviews && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Reviews'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkHelpful = async () => {
    if (isHelpful || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setIsHelpful(true);
        setHelpfulCount(helpfulCount + 1);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <StarRating rating={review.rating} size="sm" />
            {review.isVerifiedPurchase && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="size-3" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <div className="text-sm">
            <span className="font-medium">{review.User?.name || 'Anonymous'}</span>
            <span className="text-muted-foreground ml-2">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      {review.text && (
        <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed">
          {review.text}
        </p>
      )}

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4 flex gap-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="size-20 rounded-md object-cover"
            />
          ))}
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMarkHelpful}
          disabled={isHelpful || isSubmitting}
          className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
            isHelpful
              ? 'bg-eco-light text-eco-dark cursor-not-allowed'
              : 'hover:bg-gray-100 text-muted-foreground'
          }`}
        >
          <ThumbsUp className="size-4" />
          <span>
            {isHelpful ? 'Marked as helpful' : 'Helpful'} ({helpfulCount})
          </span>
        </button>
      </div>
    </div>
  );
}
