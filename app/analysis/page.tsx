import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { tradingSignals } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import Link from "next/link";
import { SectorChart } from "@/components/charts/sector-chart";
import { TechnicalSummaryChart } from "@/components/charts/technical-summary-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";

async function getAnalysisData() {
  const [sectorStats, summaryStats, riskStats, topGainers, topLosers, rsiDistribution] = await Promise.all([
    db
      .select({
        sector: tradingSignals.sector,
        count: sql<number>`count(*)`,
        avgLtp: sql<number>`avg(cast(ltp as numeric))`,
        avgGain: sql<number>`avg(cast(replace(daily_gain, '%', '') as numeric))`,
      })
      .from(tradingSignals)
      .groupBy(tradingSignals.sector)
      .orderBy(desc(sql<number>`count(*)`)),
    db
      .select({
        summary: tradingSignals.technicalSummary,
        count: sql<number>`count(*)`,
      })
      .from(tradingSignals)
      .groupBy(tradingSignals.technicalSummary)
      .orderBy(desc(sql<number>`count(*)`)),
    db
      .select({
        risk: tradingSignals.technicalEntryRisk,
        count: sql<number>`count(*)`,
      })
      .from(tradingSignals)
      .groupBy(tradingSignals.technicalEntryRisk)
      .orderBy(desc(sql<number>`count(*)`)),
    db
      .select()
      .from(tradingSignals)
      .where(sql`cast(replace(daily_gain, '%', '') as numeric) > 0`)
      .orderBy(desc(sql`cast(replace(daily_gain, '%', '') as numeric)`))
      .limit(10),
    db
      .select()
      .from(tradingSignals)
      .where(sql`cast(replace(daily_gain, '%', '') as numeric) < 0`)
      .orderBy(sql`cast(replace(daily_gain, '%', '') as numeric)`)
      .limit(10),
    db
      .select({
        rsiRange: sql<string>`CASE 
          WHEN rsi_14 < 30 THEN 'Oversold (<30)'
          WHEN rsi_14 BETWEEN 30 AND 50 THEN 'Bearish (30-50)'
          WHEN rsi_14 BETWEEN 50 AND 70 THEN 'Bullish (50-70)'
          WHEN rsi_14 > 70 THEN 'Overbought (>70)'
          ELSE 'Unknown'
        END`,
        count: sql<number>`count(*)`,
      })
      .from(tradingSignals)
      .where(sql`rsi_14 IS NOT NULL`)
      .groupBy(sql`CASE 
          WHEN rsi_14 < 30 THEN 'Oversold (<30)'
          WHEN rsi_14 BETWEEN 30 AND 50 THEN 'Bearish (30-50)'
          WHEN rsi_14 BETWEEN 50 AND 70 THEN 'Bullish (50-70)'
          WHEN rsi_14 > 70 THEN 'Overbought (>70)'
          ELSE 'Unknown'
        END`)
      .orderBy(desc(sql<number>`count(*)`)),
  ]);

  return {
    sectors: sectorStats.map((s) => ({
      sector: s.sector || "Unknown",
      count: Number(s.count),
      avgLtp: Number(s.avgLtp || 0),
      avgGain: Number(s.avgGain || 0),
    })),
    summaries: summaryStats.map((s) => ({
      summary: s.summary || "Unknown",
      count: Number(s.count),
    })),
    risks: riskStats.map((r) => ({
      risk: r.risk || "Unknown",
      count: Number(r.count),
    })),
    topGainers,
    topLosers,
    rsiDistribution: rsiDistribution.map((r) => ({
      range: r.rsiRange,
      count: Number(r.count),
    })),
  };
}

export default async function AnalysisPage() {
  const data = await getAnalysisData();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Advanced analytics and insights for NEPSE trading signals
              </p>
            </div>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="sectors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
            <TabsTrigger value="technical">Technical Indicators</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rsi">RSI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
                <CardDescription>Distribution and average performance by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <SectorChart data={data.sectors} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Sectors by Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.sectors.slice(0, 5).map((sector, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sector.sector}</p>
                          <p className="text-sm text-muted-foreground">
                            Avg Gain: {sector.avgGain.toFixed(2)}%
                          </p>
                        </div>
                        <Badge>{sector.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sector Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sectors:</span>
                      <span className="font-medium">{data.sectors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Signals per Sector:</span>
                      <span className="font-medium">
                        {Math.round(data.sectors.reduce((acc, s) => acc + s.count, 0) / data.sectors.length)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Highest Avg LTP:</span>
                      <span className="font-medium">
                        Rs. {Math.max(...data.sectors.map((s) => s.avgLtp)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Summary</CardTitle>
                  <CardDescription>Distribution of technical summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <TechnicalSummaryChart data={data.summaries} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Entry risk levels breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart data={data.risks} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Technical Summary Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {data.summaries.map((summary, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{summary.summary}</span>
                      <Badge>{summary.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Gainers</CardTitle>
                  <CardDescription>Highest daily gains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topGainers.map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-bold">{signal.symbol}</p>
                          <p className="text-sm text-muted-foreground">{signal.sector}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{signal.dailyGain}</p>
                          <p className="text-sm">Rs. {signal.ltp}</p>
                        </div>
                      </div>
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
                    {data.topLosers.map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-bold">{signal.symbol}</p>
                          <p className="text-sm text-muted-foreground">{signal.sector}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{signal.dailyGain}</p>
                          <p className="text-sm">Rs. {signal.ltp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rsi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RSI Distribution</CardTitle>
                <CardDescription>Relative Strength Index analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.rsiDistribution.map((rsi, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <span className="font-medium">{rsi.range}</span>
                      <Badge variant="secondary">{rsi.count} signals</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
