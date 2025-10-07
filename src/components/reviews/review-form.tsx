'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './star-rating';
import { createReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  productTitle: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  productTitle,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    startTransition(async () => {
      const result = await createReview({
        productId,
        rating,
        text: text.trim(),
        orderId,
      });

      if (result.success) {
        setText('');
        setRating(0);
        router.refresh();
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to submit review');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Share your experience with {productTitle}
        </p>
      </div>

      {/* Rating Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            interactive
            onRatingChange={setRating}
            size="lg"
          />
          {rating > 0 && (
            <span className="text-muted-foreground text-sm">
              {rating === 5 && 'Excellent!'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Good'}
              {rating === 2 && 'Fair'}
              {rating === 1 && 'Poor'}
            </span>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
          Your Review <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you like or dislike about this product? How did it work for you?"
          rows={6}
          maxLength={1000}
          className="resize-none"
        />
        <div className="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>{text.length < 10 ? `Minimum 10 characters` : 'Looking good!'}</span>
          <span>{text.length} / 1000</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || rating === 0 || text.length < 10}>
          {isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
