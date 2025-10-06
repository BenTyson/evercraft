'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
}

export function FavoriteButton({ productId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFavorite = () => {
    // TODO: Persist favorite state to database
    setIsFavorited(!isFavorited);
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      variant="outline"
      size="lg"
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
