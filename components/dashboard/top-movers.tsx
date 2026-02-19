'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendBadge } from '@/components/shared/trend-badge';
import { ScoreIndicator } from '@/components/shared/score-indicator';
import { ZoneBadge } from '@/components/shared/score-indicator';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';
import type { FeaturedSignal } from '@/types/features';

interface TopMoversProps {
  gainers: FeaturedSignal[];
  losers: FeaturedSignal[];
  momentum: FeaturedSignal[];
}

export function TopMovers({ gainers, losers, momentum }: TopMoversProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-green-600" />
            Top Gainers
          </CardTitle>
          <CardDescription>Highest daily gains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gainers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gainers data</p>
            ) : (
              gainers.map((signal, index) => (
                <Link
                  key={`${signal.symbol}-${index}`}
                  href={`/stock/${signal.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-bold">{signal.symbol}</p>
                    <p className="text-xs text-muted-foreground">{signal.sector}</p>
                  </div>
                  <div className="text-right">
                    <TrendBadge value={signal.daily_gain_pct} type="gain" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Rs. {signal.ltp.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5 text-red-600" />
            Top Losers
          </CardTitle>
          <CardDescription>Lowest daily gains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {losers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No losers data</p>
            ) : (
              losers.map((signal, index) => (
                <Link
                  key={`${signal.symbol}-${index}`}
                  href={`/stock/${signal.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-bold">{signal.symbol}</p>
                    <p className="text-xs text-muted-foreground">{signal.sector}</p>
                  </div>
                  <div className="text-right">
                    <TrendBadge value={signal.daily_gain_pct} type="gain" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Rs. {signal.ltp.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            High Momentum
          </CardTitle>
          <CardDescription>Strongest momentum scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {momentum.length === 0 ? (
              <p className="text-sm text-muted-foreground">No momentum data</p>
            ) : (
              momentum.map((signal, index) => (
                <Link
                  key={`${signal.symbol}-${index}`}
                  href={`/stock/${signal.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-bold">{signal.symbol}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ZoneBadge rsi={signal.rsi_14} />
                    </div>
                  </div>
                  <div className="text-right">
                    <ScoreIndicator score={signal.momentum_score} showLabel={false} size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Composite: {signal.signal_composite.toFixed(1)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
