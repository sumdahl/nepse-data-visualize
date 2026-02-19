'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWatchlist } from '@/lib/hooks';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface WatchlistPanelProps {
  onClose?: () => void;
}

export function WatchlistPanel({ onClose }: WatchlistPanelProps) {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No stocks in your watchlist yet.
            <br />
            Click the star icon to add stocks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Watchlist ({watchlist.length})</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearWatchlist}>
            Clear All
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4 pt-0">
            {watchlist.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Link href={`/stock/${item.symbol}`} className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-50 hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWatchlist(item.symbol)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
