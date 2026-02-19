'use client';

import { useWatchlist } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Link from 'next/link';

export function WatchlistIndicator() {
  const { count } = useWatchlist();

  if (count === 0) return null;

  return (
    <Link href="/watchlist">
      <Button variant="ghost" size="sm" className="gap-2">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="hidden sm:inline">{count}</span>
      </Button>
    </Link>
  );
}
