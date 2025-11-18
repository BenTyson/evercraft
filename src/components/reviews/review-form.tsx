'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './star-rating';
import { FormField } from '@/components/forms/form-field';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { validateForm, hasErrors, ValidationSchema } from '@/lib/validation';
import { createReview } from '@/actions/reviews';

interface FormData {
  rating: number;
  text: string;
}

const validationSchema: ValidationSchema<FormData> = {
  rating: {
    validate: (value) => (value === 0 ? 'Please select a rating' : true),
  },
  text: {
    required: 'Review text is required',
    minLength: { value: 10, message: 'Review must be at least 10 characters' },
    maxLength: { value: 1000, message: 'Review must not exceed 1000 characters' },
  },
};

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

  const { isSubmitting, error, handleSubmit } = useFormSubmission({
    onSuccess: () => {
      setFormData({ rating: 0, text: '' });
      router.refresh();
      onSuccess?.();
    },
  });

  const [formData, setFormData] = useState<FormData>({
    rating: 0,
    text: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(formData, validationSchema);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    // Submit form
    await handleSubmit(async () => {
      const result = await createReview({
        productId,
        rating: formData.rating,
        text: formData.text.trim(),
        orderId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit review');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Share your experience with {productTitle}
        </p>
      </div>

      {/* Rating Selection */}
      <FormField label="Your Rating" name="rating" required error={fieldErrors.rating}>
        <div className="flex items-center gap-3">
          <StarRating
            rating={formData.rating}
            interactive
            onRatingChange={(rating) => {
              setFormData({ ...formData, rating });
              setFieldErrors({ ...fieldErrors, rating: undefined });
            }}
            size="lg"
          />
          {formData.rating > 0 && (
            <span className="text-muted-foreground text-sm">
              {formData.rating === 5 && 'Excellent!'}
              {formData.rating === 4 && 'Very Good'}
              {formData.rating === 3 && 'Good'}
              {formData.rating === 2 && 'Fair'}
              {formData.rating === 1 && 'Poor'}
            </span>
          )}
        </div>
      </FormField>

      {/* Review Text */}
      <FormField label="Your Review" name="text" required error={fieldErrors.text}>
        <Textarea
          id="review-text"
          value={formData.text}
          onChange={(e) => {
            setFormData({ ...formData, text: e.target.value });
            setFieldErrors({ ...fieldErrors, text: undefined });
          }}
          placeholder="What did you like or dislike about this product? How did it work for you?"
          rows={6}
          maxLength={1000}
          className="resize-none"
          disabled={isSubmitting}
          aria-invalid={!!fieldErrors.text}
        />
        <div className="text-muted-foreground mt-1 flex justify-between text-xs">
          <span>{formData.text.length < 10 ? `Minimum 10 characters` : 'Looking good!'}</span>
          <span>{formData.text.length} / 1000</span>
        </div>
      </FormField>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || formData.rating === 0 || formData.text.length < 10}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
