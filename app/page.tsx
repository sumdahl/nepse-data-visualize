import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { tradingSignals } from "@/lib/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import Link from "next/link";
import { TrendingUp, TrendingDown, BarChart3, Activity, ArrowRight } from "lucide-react";
import { SectorChart } from "@/components/charts/sector-chart";
import { TechnicalSummaryChart } from "@/components/charts/technical-summary-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";

async function getStats() {
  const [totalSignals, latestSignals, sectorStats, summaryStats, riskStats, topPerformers] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(tradingSignals),
    db.select().from(tradingSignals).orderBy(desc(tradingSignals.scrapedAt)).limit(1),
    db
      .select({
        sector: tradingSignals.sector,
        count: sql<number>`count(*)`,
        avgLtp: sql<number>`avg(cast(ltp as numeric))`,
      })
      .from(tradingSignals)
      .groupBy(tradingSignals.sector)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(10),
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
      .where(sql`cast(daily_gain as numeric) > 0`)
      .orderBy(desc(sql`cast(daily_gain as numeric)`))
      .limit(5),
  ]);

  return {
    total: Number(totalSignals[0]?.count || 0),
    latestScrape: latestSignals[0]?.scrapedAt || null,
    sectors: sectorStats.map((s) => ({
      sector: s.sector || "Unknown",
      count: Number(s.count),
      avgLtp: Number(s.avgLtp || 0),
    })),
    summaries: summaryStats.map((s) => ({
      summary: s.summary || "Unknown",
      count: Number(s.count),
    })),
    risks: riskStats.map((r) => ({
      risk: r.risk || "Unknown",
      count: Number(r.count),
    })),
    topPerformers: topPerformers,
  };
}

function getSummaryColor(summary: string | null) {
  if (!summary) return "secondary";
  if (summary.includes("Strong Bullish")) return "default";
  if (summary.includes("Bullish")) return "secondary";
  if (summary.includes("Bearish")) return "destructive";
  return "outline";
}

function getRiskColor(risk: string | null) {
  if (!risk) return "secondary";
  if (risk.includes("High")) return "destructive";
  if (risk.includes("Medium")) return "default";
  return "secondary";
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">NEPSE Trading Signals</h1>
              <p className="text-muted-foreground mt-1">
                Real-time trading signals and analysis for Nepal Stock Exchange
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/signals">View All Signals</Link>
              </Button>
              <Button asChild>
                <Link href="/analysis">
                  Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Scrape</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.latestScrape
                  ? new Date(stats.latestScrape).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "No data"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.latestScrape
                  ? new Date(stats.latestScrape).toLocaleTimeString()
                  : "Run scraper first"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sectors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sectors.length}</div>
              <p className="text-xs text-muted-foreground">Unique sectors tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Gainers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topPerformers.length}</div>
              <p className="text-xs text-muted-foreground">Positive gains today</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sector Distribution</CardTitle>
                  <CardDescription>Signals by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <SectorChart data={stats.sectors} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Entry risk levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart data={stats.risks} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Sectors</CardTitle>
                <CardDescription>Most active sectors by signal count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.sectors.slice(0, 5).map((sector, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{sector.sector}</p>
                          <p className="text-sm text-muted-foreground">
                            Avg LTP: Rs. {sector.avgLtp.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{sector.count} signals</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Sectors</CardTitle>
                <CardDescription>Complete sector breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.sectors.map((sector, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{sector.sector}</p>
                        <p className="text-sm text-muted-foreground">
                          {sector.count} signals • Avg: Rs. {sector.avgLtp.toFixed(2)}
                        </p>
                      </div>
                      <Badge>{sector.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Summary Distribution</CardTitle>
                <CardDescription>Breakdown by technical indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <TechnicalSummaryChart data={stats.summaries} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {stats.summaries.map((summary, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{summary.summary}</CardTitle>
                      <Badge variant={getSummaryColor(summary.summary)}>{summary.count}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Stocks with highest daily gains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topPerformers.map((signal, index) => (
                    <div
                      key={signal.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{signal.symbol}</p>
                          <p className="text-sm text-muted-foreground">{signal.sector}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-600">{signal.dailyGain}</p>
                        <p className="text-sm text-muted-foreground">Rs. {signal.ltp}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={getSummaryColor(signal.technicalSummary)}>
                            {signal.technicalSummary}
                          </Badge>
                          <Badge variant={getRiskColor(signal.technicalEntryRisk)}>
                            {signal.technicalEntryRisk}
                          </Badge>
                        </div>
                      </div>
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
