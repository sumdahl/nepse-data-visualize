import { Suspense } from "react";
import { SignalsTable } from "@/components/signals-table";
import { SignalsFilters } from "@/components/signals-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signalsService } from "@/services/signals-service";

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; search?: string }>;
}) {
  const { sector, search } = await searchParams;
  const signals = await signalsService.getSignals({ sector, search });
  const sectors = await signalsService.getSectorList();
  const stats = await signalsService.getSignalStats(signals);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Trading Signals</h1>
          <p className="text-muted-foreground mt-1">
            Browse and analyze all NEPSE trading signals
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Suspense fallback={<div>Loading filters...</div>}>
          <SignalsFilters sectors={sectors} />
        </Suspense>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Symbols</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueSymbols}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueSectors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {stats.latestUpdate
                  ? new Date(stats.latestUpdate).toLocaleString()
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signals Table */}
        <SignalsTable signals={signals} />
      </div>
    </div>
  );
}
