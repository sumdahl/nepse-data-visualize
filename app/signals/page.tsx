import { Suspense } from 'react';
import { StockTable, StockFilters } from '@/components/stocks';
import { DataCardSkeleton } from '@/components/shared/loading-skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataCard } from '@/components/shared/data-card';
import { getFeaturedSignals, getSectorList } from '@/lib/services/data-service';

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; search?: string; rsiZone?: string; sentiment?: string; sortBy?: string }>;
}) {
  const params = await searchParams;
  
  const [signals, sectors] = await Promise.all([
    getFeaturedSignals({
      sector: params.sector,
      symbol: params.search,
      rsiZone: params.rsiZone,
      limit: 500,
    }),
    getSectorList(),
  ]);

  const stats = {
    total: signals.length,
    uniqueSymbols: new Set(signals.map(s => s.symbol)).size,
    uniqueSectors: new Set(signals.map(s => s.sector)).size,
    avgMomentum: signals.length > 0
      ? signals.reduce((sum, s) => sum + s.momentum_score, 0) / signals.length
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Trading Signals</h1>
          <p className="text-muted-foreground mt-1">
            Browse and analyze all NEPSE trading signals with momentum scores
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <DataCard title="Total Signals" value={stats.total} />
          <DataCard title="Unique Symbols" value={stats.uniqueSymbols} />
          <DataCard title="Sectors" value={stats.uniqueSectors} />
          <DataCard
            title="Avg Momentum"
            value={stats.avgMomentum.toFixed(1)}
            trend={stats.avgMomentum > 0 ? 'up' : stats.avgMomentum < 0 ? 'down' : 'neutral'}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter signals by sector, RSI zone, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading filters...</div>}>
              <StockFilters sectors={sectors} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signals</CardTitle>
            <CardDescription>
              {signals.length} signals found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<DataCardSkeleton />}>
              <StockTable signals={signals} sortBy={params.sortBy || 'composite'} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}