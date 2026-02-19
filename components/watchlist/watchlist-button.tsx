'use client';

import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/lib/hooks';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  symbol: string;
  variant?: 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg';
}

export function WatchlistButton({ symbol, variant = 'icon', size = 'md' }: WatchlistButtonProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(symbol);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  if (variant === 'badge') {
    return (
      <Button
        variant={inWatchlist ? 'default' : 'outline'}
        size="sm"
        onClick={() => toggleWatchlist(symbol)}
      >
        <Star
          className={cn(
            'h-4 w-4 mr-1',
            inWatchlist && 'fill-current'
          )}
        />
        {inWatchlist ? 'Watching' : 'Watch'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleWatchlist(symbol)}
      className={sizeClasses[size]}
      title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Star
        className={cn(
          'h-4 w-4',
          inWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
