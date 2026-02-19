import { MarketOverview, TopMovers, SectorGrid } from '@/components/dashboard';
import { DataCardSkeleton } from '@/components/shared/loading-skeleton';
import { SectorChart } from '@/components/charts/sector-chart';
import { TechnicalSummaryChart } from '@/components/charts/technical-summary-chart';
import { RiskDistributionChart } from '@/components/charts/risk-distribution-chart';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMarketOverview, getHistoricalStats } from '@/lib/services/data-service';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default async function HomePage() {
  const [marketData, historicalStats] = await Promise.all([
    getMarketOverview(),
    getHistoricalStats(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/40 py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                <Zap className="mr-1 h-3 w-3" />
                Live Market Data
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                NEPSE Trading Signals
              </h1>
              <p className="max-w-[600px] text-muted-foreground">
                Real-time technical analysis with momentum scores, RSI zones, and signal composites for the Nepal Stock Exchange.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/signals">
                  View Signals <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/analysis">Deep Analysis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-8 space-y-8">
        {marketData && <MarketOverview data={marketData} />}

        {marketData && (
          <TopMovers
            gainers={marketData.topGainers || []}
            losers={marketData.topLosers || []}
            momentum={marketData.topMomentum || []}
          />
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full overflow-x-auto justify-start">
            <TabsTrigger value="overview">Market Overview</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {marketData?.sectors && <SectorGrid sectors={marketData.sectors} />}
              {historicalStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Data Coverage</CardTitle>
                    <CardDescription>Historical data summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Records</p>
                        <p className="text-xl font-bold">{historicalStats.totalRecords}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unique Symbols</p>
                        <p className="text-xl font-bold">{historicalStats.uniqueSymbols}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date Range</p>
                        <p className="text-sm font-medium">{historicalStats.dateRange.start} to {historicalStats.dateRange.end}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sectors</p>
                        <p className="text-xl font-bold">{historicalStats.sectors.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            {marketData?.sectors && (
              <Card>
                <CardHeader>
                  <CardTitle>Sector Distribution</CardTitle>
                  <CardDescription>Signal concentration across sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <SectorChart data={marketData.sectors.map(s => ({
                    sector: s.sector,
                    count: s.count,
                    avgLtp: s.avgLtp,
                  }))} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Market Sentiment</CardTitle>
                  <CardDescription>Momentum distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  {marketData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Average Momentum</span>
                        <span className={`font-bold ${marketData.avgMomentum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {marketData.avgMomentum.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Average RSI</span>
                        <span className="font-bold">{marketData.avgRsi.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bullish Signals</span>
                        <span className="font-bold text-green-600">{marketData.bullishCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Overbought</span>
                        <span className="font-bold text-red-600">{marketData.overboughtCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Oversold</span>
                        <span className="font-bold text-green-600">{marketData.oversoldCount}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sector Momentum</CardTitle>
                  <CardDescription>Average momentum by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-auto">
                    {marketData?.sectors?.slice(0, 10).map(sector => (
                      <div key={sector.sector} className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm truncate" title={sector.sector}>{sector.sector}</span>
                        <span className={`text-sm font-medium ${sector.avgMomentum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {sector.avgMomentum.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}