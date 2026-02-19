import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectorChart, TechnicalSummaryChart, RiskDistributionChart, RSIGauge } from '@/components/charts';
import { TrendBadge } from '@/components/shared/trend-badge';
import { ScoreIndicator } from '@/components/shared/score-indicator';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { getMarketOverview, getFeaturedSignals } from '@/lib/services/data-service';

function getSummaryLabel(sentiment: number): string {
  if (sentiment >= 1.5) return 'Strong Bullish';
  if (sentiment >= 0.5) return 'Bullish';
  if (sentiment >= -0.5) return 'Neutral';
  if (sentiment >= -1.5) return 'Bearish';
  return 'Strong Bearish';
}

export default async function AnalysisPage() {
  const [market, signals] = await Promise.all([
    getMarketOverview(),
    getFeaturedSignals({ limit: 1000 }),
  ]);

  // Compute summary stats for the Technical tab
  const summaryCounts = signals.reduce((acc, s) => {
    const label = getSummaryLabel(s.technical_summary);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySummary = Object.entries(summaryCounts)
    .map(([summary, count]) => ({ summary, count }))
    .sort((a, b) => b.count - a.count);

  const stats = {
    bySector: market.sectors.map(s => ({ sector: s.sector, count: s.count })),
    bySummary,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Advanced analytics with momentum scores and signal composites
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full overflow-x-auto justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="movers">Movers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Market Momentum</CardTitle>
                  <CardDescription>Average momentum score</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoreIndicator score={market.avgMomentum} label="Average" size="lg" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RSI Distribution</CardTitle>
                  <CardDescription>Market RSI overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <RSIGauge value={market.avgRsi} />
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Overbought:</span>
                        <span className="font-medium text-red-600">{market.overboughtCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Oversold:</span>
                        <span className="font-medium text-green-600">{market.oversoldCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Signal Distribution</CardTitle>
                  <CardDescription>Bullish vs Bearish</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>Bullish</span>
                      </div>
                      <span className="font-bold text-green-600">{market.bullishCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span>Bearish</span>
                      </div>
                      <span className="font-bold text-red-600">{market.bearishCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Signal concentration across sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <SectorChart data={market.sectors.map(s => ({
                  sector: s.sector,
                  count: s.count,
                  avgLtp: 0,
                }))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Momentum</CardTitle>
                <CardDescription>Average momentum by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {market.sectors.map(sector => (
                    <div key={sector.sector} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{sector.sector}</p>
                        <p className="text-sm text-muted-foreground">{sector.count} signals</p>
                      </div>
                      <ScoreIndicator score={sector.avgMomentum} showLabel={false} size="sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Summary</CardTitle>
                  <CardDescription>Distribution of technical summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <TechnicalSummaryChart data={stats.bySummary} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Entry risk levels breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart data={stats.bySummary.map(s => ({
                    risk: s.summary,
                    count: s.count,
                  }))} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="movers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Gainers</CardTitle>
                  <CardDescription>Highest daily gains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {market.topGainers.map(signal => (
                      <Link key={signal.symbol} href={`/stock/${signal.symbol}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-bold">{signal.symbol}</p>
                            <p className="text-sm text-muted-foreground">{signal.sector}</p>
                          </div>
                          <div className="text-right">
                            <TrendBadge value={signal.daily_gain_pct} type="gain" />
                            <p className="text-sm mt-1">Rs. {signal.ltp}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Losers</CardTitle>
                  <CardDescription>Lowest daily gains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {market.topLosers.map(signal => (
                      <Link key={signal.symbol} href={`/stock/${signal.symbol}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-bold">{signal.symbol}</p>
                            <p className="text-sm text-muted-foreground">{signal.sector}</p>
                          </div>
                          <div className="text-right">
                            <TrendBadge value={signal.daily_gain_pct} type="gain" />
                            <p className="text-sm mt-1">Rs. {signal.ltp}</p>
                          </div>
                        </div>
                      </Link>
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
