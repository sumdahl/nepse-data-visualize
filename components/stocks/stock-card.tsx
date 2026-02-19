'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreIndicator, ZoneBadge } from '@/components/shared/score-indicator';
import { TrendBadge } from '@/components/shared/trend-badge';
import { useWatchlist } from '@/lib/hooks';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import type { FeaturedSignal } from '@/types/features';

interface StockCardProps {
  signal: FeaturedSignal;
  compact?: boolean;
}

export function StockCard({ signal, compact = false }: StockCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(signal.symbol);

  const getTrendIcon = () => {
    if (signal.daily_gain_pct > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (signal.daily_gain_pct < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (compact) {
    return (
      <Link href={`/stock/${signal.symbol}`}>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-bold">{signal.symbol}</p>
                  <p className="text-xs text-muted-foreground">{signal.sector}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">Rs. {signal.ltp.toLocaleString()}</p>
                <TrendBadge value={signal.daily_gain_pct} type="gain" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link href={`/stock/${signal.symbol}`} className="hover:underline">
              <h3 className="text-lg font-bold">{signal.symbol}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">{signal.sector}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleWatchlist(signal.symbol)}
              className="h-8 w-8"
            >
              <Star
                className={`h-4 w-4 ${inWatchlist ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
              />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="font-bold">Rs. {signal.ltp.toLocaleString()}</span>
            </div>
            <TrendBadge value={signal.daily_gain_pct} type="gain" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">RSI (14)</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{signal.rsi_14.toFixed(1)}</span>
                <ZoneBadge rsi={signal.rsi_14} />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">MACD</p>
              <TrendBadge value={signal.macd_signal} type="sentiment" />
            </div>
          </div>

          <div className="space-y-2">
            <ScoreIndicator score={signal.momentum_score} label="Momentum" />
            <ScoreIndicator score={signal.signal_composite} label="Composite" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <TrendBadge value={signal.technical_summary} type="sentiment" />
            </div>
            <span className="text-xs text-muted-foreground">
              {signal.scrape_date}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
