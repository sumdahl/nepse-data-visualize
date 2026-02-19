'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataCard } from '@/components/shared/data-card';
import { TrendBadge } from '@/components/shared/trend-badge';
import { ScoreIndicator } from '@/components/shared/score-indicator';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Clock } from 'lucide-react';
import type { FeaturedSignal } from '@/types/features';

interface MarketOverviewProps {
  data: {
    totalSignals: number;
    totalSymbols: number;
    overboughtCount: number;
    oversoldCount: number;
    bullishCount: number;
    bearishCount: number;
    avgMomentum: number;
    avgRsi: number;
    latestDate: string | null;
  };
}

export function MarketOverview({ data }: MarketOverviewProps) {
  const marketSentiment = data.avgMomentum > 20 ? 'bullish' : data.avgMomentum < -20 ? 'bearish' : 'neutral';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Total Signals"
          value={data.totalSignals}
          description={`${data.totalSymbols} unique symbols`}
          icon={BarChart3}
        />
        <DataCard
          title="Avg Momentum"
          value={data.avgMomentum.toFixed(1)}
          description="Market momentum score"
          icon={Activity}
          trend={data.avgMomentum > 0 ? 'up' : data.avgMomentum < 0 ? 'down' : 'neutral'}
        />
        <DataCard
          title="Bullish Signals"
          value={data.bullishCount}
          description="Stocks with composite > 25"
          icon={TrendingUp}
          trend="up"
        />
        <DataCard
          title="Bearish Signals"
          value={data.bearishCount}
          description="Stocks with composite < -25"
          icon={TrendingDown}
          trend="down"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">RSI Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Overbought</span>
                </div>
                <span className="font-bold text-red-500">{data.overboughtCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Oversold</span>
                </div>
                <span className="font-bold text-green-500">{data.oversoldCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TrendBadge value={marketSentiment === 'bullish' ? 1 : marketSentiment === 'bearish' ? -1 : 0} type="sentiment" />
              <ScoreIndicator score={data.avgMomentum} label="Avg Momentum" />
              <div className="text-sm text-muted-foreground">
                Avg RSI: {data.avgRsi.toFixed(1)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {data.latestDate
                  ? new Date(data.latestDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'No data available'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
