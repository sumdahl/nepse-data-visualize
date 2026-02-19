import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceHistoryChart, MomentumChart, RSIGauge } from '@/components/charts';
import { TrendBadge } from '@/components/shared/trend-badge';
import { ScoreIndicator, ZoneBadge } from '@/components/shared/score-indicator';
import { WatchlistButton } from '@/components/watchlist';
import { getStockData } from '@/lib/services/data-service';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const stockData = await getStockData(symbol, 30);

  if (!stockData) {
    notFound();
  }

  const { latest, priceHistory, momentumHistory, stats } = stockData;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/signals">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{latest.symbol}</h1>
                  <WatchlistButton symbol={latest.symbol} variant="badge" />
                </div>
                <p className="text-muted-foreground">{latest.sector}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">Rs. {latest.ltp.toLocaleString()}</p>
              <TrendBadge value={latest.daily_gain_pct} type="gain" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Momentum</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreIndicator score={latest.momentum_score} showLabel={false} size="md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Signal Composite</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreIndicator score={latest.signal_composite} showLabel={false} size="md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">RSI (14)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{latest.rsi_14.toFixed(1)}</span>
                <ZoneBadge rsi={latest.rsi_14} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Price Change</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendBadge value={stats.price_change_pct} type="gain" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.date_range.start} to {stats.date_range.end}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PriceHistoryChart
            data={priceHistory}
            title="Price History"
            description="Last 30 days"
            showGain
          />
          <MomentumChart
            data={momentumHistory}
            title="Momentum History"
            description="Momentum and signal composite over time"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">MACD Signal</span>
                  <TrendBadge value={latest.macd_signal} type="sentiment" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">MFI (14)</span>
                  <span className="font-medium">{latest.mfi_14.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stoch (14)</span>
                  <span className="font-medium">{latest.sto_14.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CCI (14)</span>
                  <span className="font-medium">{latest.cci_14.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stoch RSI</span>
                  <span className="font-medium">{latest.stoch_rsi.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">%B</span>
                  <span className="font-medium">{latest.percent_b}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moving Averages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price vs SMA10</span>
                  <Badge variant={latest.price_above_sma10 ? 'default' : 'secondary'}>
                    {latest.price_above_sma10 ? 'Above' : 'Below'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price vs SMA20</span>
                  <Badge variant={latest.price_above_sma20 ? 'default' : 'secondary'}>
                    {latest.price_above_sma20 ? 'Above' : 'Below'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price vs SMA50</span>
                  <Badge variant={latest.price_above_sma50 ? 'default' : 'secondary'}>
                    {latest.price_above_sma50 ? 'Above' : 'Below'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price vs SMA200</span>
                  <Badge variant={latest.price_above_sma200 ? 'default' : 'secondary'}>
                    {latest.price_above_sma200 ? 'Above' : 'Below'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SMA5 vs SMA20</span>
                  <TrendBadge value={latest.sma5_above_sma20} type="sentiment" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SMA50 vs SMA200</span>
                  <TrendBadge value={latest.sma50_vs_sma200} type="sentiment" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Signal Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Technical Summary</span>
                  <TrendBadge value={latest.technical_summary} type="sentiment" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Technical Risk</span>
                  <Badge variant={latest.technical_risk === 0 ? 'default' : latest.technical_risk === 1 ? 'secondary' : 'destructive'}>
                    {latest.technical_risk === 0 ? 'Low' : latest.technical_risk === 1 ? 'Medium' : 'High'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trend (3M)</span>
                  <Badge variant="outline">{latest.trend_3m}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Volume Trend</span>
                  <TrendBadge value={latest.volume_trend} type="trend" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Beta (3M)</span>
                  <span className="font-medium">{latest.beta_3m.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">MA Alignment</span>
                  <span className="font-medium">{latest.ma_alignment_score}/4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}