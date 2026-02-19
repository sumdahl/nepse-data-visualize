'use client';

import { useWatchlist } from '@/lib/hooks';
import { StockCard } from '@/components/stocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FeaturedSignal } from '@/types/features';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const [signals, setSignals] = useState<FeaturedSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlistSignals() {
      if (watchlist.length === 0) {
        setSignals([]);
        setIsLoading(false);
        return;
      }

      try {
        const symbols = watchlist.map(w => w.symbol);
        const res = await fetch(`/api/featured?limit=${symbols.length}`);
        const data = await res.json();
        
        const watchlistSignals = data.data.filter((s: FeaturedSignal) =>
          symbols.includes(s.symbol)
        );
        setSignals(watchlistSignals);
      } catch (error) {
        console.error('Failed to fetch watchlist signals:', error);
      }
      setIsLoading(false);
    }

    fetchWatchlistSignals();
  }, [watchlist]);

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
            <p className="text-muted-foreground mt-1">Your tracked stocks</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Your watchlist is empty</CardTitle>
              <CardDescription>
                Start tracking stocks by clicking the star icon on any signal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/signals">
                  Browse Signals <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-20 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {signals.map((signal) => (
              <StockCard key={signal.symbol} signal={signal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
