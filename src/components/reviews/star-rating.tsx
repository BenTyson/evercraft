'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isPartial = !isFilled && starValue - 1 < rating;
        const fillPercentage = isPartial ? (rating - (starValue - 1)) * 100 : 0;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={cn(
              'relative',
              interactive && 'cursor-pointer transition-transform hover:scale-110',
              !interactive && 'cursor-default'
            )}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            {isPartial ? (
              // Partial star with gradient
              <div className="relative">
                <Star
                  className={cn(sizeClasses[size], 'text-gray-300')}
                  fill="currentColor"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(sizeClasses[size], 'text-yellow-400')}
                    fill="currentColor"
                  />
                </div>
              </div>
            ) : (
              // Full or empty star
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled ? 'text-yellow-400' : 'text-gray-300'
                )}
                fill="currentColor"
              />
            )}
          </button>
        );
      })}
      {showNumber && (
        <span className="text-muted-foreground ml-1 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
