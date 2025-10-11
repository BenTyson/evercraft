'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/actions/favorites';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorited: boolean;
}

export function FavoriteButton({ productId, initialIsFavorited }: FavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);

  const handleToggleFavorite = async () => {
    // Optimistic update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    try {
      const result = await toggleFavorite(productId);

      if (!result.success) {
        // Revert on error
        setIsFavorited(previousState);
        alert(result.error || 'Failed to update favorite');
        return;
      }

      // Update with server response
      setIsFavorited(result.isFavorited || false);

      // Trigger a soft refresh to update any server components
      startTransition(() => {
        router.refresh();
      });
    } catch {
      // Revert on error
      setIsFavorited(previousState);
      alert('Failed to update favorite');
    }
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      variant="outline"
      size="lg"
      disabled={isPending}
      className={cn(
        'flex-shrink-0',
        isFavorited &&
          'border-pink-500 bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600'
      )}
    >
      <Heart className={cn('size-5', isFavorited && 'fill-current')} />
    </Button>
  );
}
