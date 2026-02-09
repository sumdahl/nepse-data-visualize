import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { SectorChart } from "@/components/charts/sector-chart";
import { TechnicalSummaryChart } from "@/components/charts/technical-summary-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { statsService } from "@/services/stats-service";
import { getSummaryColor, getRiskColor } from "@/lib/utils/badge-helpers";

export default async function Home() {
  const stats = await statsService.getDashboardStats();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-muted/40 pb-12 pt-8 md:pt-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                <Zap className="mr-1 h-3 w-3" />
                Live Market Data
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                NEPSE Trading Signals
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Advanced technical analysis and real-time signals for the Nepal
                Stock Exchange. Make data-driven decisions.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="h-10 px-8">
                <Link href="/signals">
                  View Signals <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-10 px-8">
                <Link href="/analysis">Deep Analysis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 md:px-6 py-8 space-y-8">
        {/* Market Pulse Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Signals
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Active trading signals
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Market Status
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.latestScrape
                  ? "Active" // Simplified for now, could be based on time
                  : "Offline"}
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {stats.latestScrape
                  ? new Date(stats.latestScrape).toLocaleTimeString()
                  : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sectors Tracked
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sectors.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all industries
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bullish Signals
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.summaries.find((s) => s.summary.includes("Bullish"))
                  ?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Strong buying opportunities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Market Overview</TabsTrigger>
              <TabsTrigger value="performance">Top Performers</TabsTrigger>
              <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 shadow-sm">
                <CardHeader>
                  <CardTitle>Sector Distribution</CardTitle>
                  <CardDescription>
                    Signal concentration across different market sectors
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <SectorChart data={stats.sectors} />
                </CardContent>
              </Card>
              <Card className="col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle>Technical Summary</CardTitle>
                  <CardDescription>
                    Overall market sentiment based on technical indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TechnicalSummaryChart data={stats.summaries} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                  <CardDescription>
                    Entry risk distribution for current signals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart data={stats.risks} />
                </CardContent>
              </Card>
              <Card className="col-span-4 shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Market Activity</CardTitle>
                  <CardDescription>Latest signals and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {stats.topPerformers.slice(0, 5).map((signal) => (
                      <div key={signal.id} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {signal.symbol}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {signal.sector}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {signal.dailyGain && !signal.dailyGain.startsWith("-")
                            ? "+"
                            : ""}
                          {signal.dailyGain}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Top Daily Gainers</CardTitle>
                <CardDescription>
                  Stocks with the highest percentage gain today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>LTP</TableHead>
                      <TableHead>Daily Gain</TableHead>
                      <TableHead>Signal</TableHead>
                      <TableHead className="text-right">Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topPerformers.map((signal) => (
                      <TableRow key={signal.id}>
                        <TableCell className="font-medium">
                          {signal.symbol}
                        </TableCell>
                        <TableCell>{signal.sector}</TableCell>
                        <TableCell>Rs. {signal.ltp}</TableCell>
                        <TableCell className="text-green-600 font-bold">
                          {signal.dailyGain}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getSummaryColor(signal.technicalSummary)}
                          >
                            {signal.technicalSummary}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {signal.technicalEntryRisk}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Sector Breakdown</CardTitle>
                <CardDescription>
                  Detailed view of signals per sector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sector</TableHead>
                      <TableHead>Signal Count</TableHead>
                      <TableHead className="text-right">Avg LTP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.sectors.map((sector) => (
                      <TableRow key={sector.sector}>
                        <TableCell className="font-medium">
                          {sector.sector}
                        </TableCell>
                        <TableCell>{sector.count}</TableCell>
                        <TableCell className="text-right">
                          Rs. {sector.avgLtp.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
