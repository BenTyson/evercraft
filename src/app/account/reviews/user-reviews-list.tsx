'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/reviews/star-rating';
import { ReviewForm } from '@/components/reviews/review-form';
import { deleteReview } from '@/actions/reviews';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  text: string | null;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  Product: {
    id: string;
    title: string;
    images: Array<{
      url: string;
      altText: string | null;
    }>;
  } | null;
}

interface UserReviewsListProps {
  reviews: Review[];
}

export function UserReviewsList({ reviews: initialReviews }: UserReviewsListProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (reviewId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete your review for "${productTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteReview(reviewId);

      if (result.success) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete review');
      }
    });
  };

  const handleEditSuccess = () => {
    setEditingReviewId(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-6">
          {editingReviewId === review.id ? (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Edit Review</h3>
              <ReviewForm
                productId={review.Product?.id || ''}
                productTitle={review.Product?.title || ''}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingReviewId(null)}
              />
            </div>
          ) : (
            <>
              {/* Product Info */}
              {review.Product && (
                <Link
                  href={`/products/${review.Product.id}`}
                  className="mb-4 flex items-center gap-4 hover:opacity-80"
                >
                  <div className="relative size-16 overflow-hidden rounded-md bg-gray-100">
                    {review.Product.images[0] && (
                      <Image
                        src={review.Product.images[0].url}
                        alt={review.Product.images[0].altText || review.Product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold hover:underline">{review.Product.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      Reviewed {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              )}

              {/* Review Content */}
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {review.isVerifiedPurchase && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.text && (
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                    {review.text}
                  </p>
                )}
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="mb-4 flex gap-2">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative size-20 overflow-hidden rounded-md bg-gray-100"
                    >
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingReviewId(review.id)}
                  disabled={isPending}
                  className="flex items-center gap-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(review.id, review.Product?.title || 'this product')}
                  disabled={isPending}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
