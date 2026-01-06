import { db } from "@/lib/db";
import { tradingSignals } from "@/lib/db/schema";
import { desc, sql, like, or } from "drizzle-orm";
import { Suspense } from "react";
import { SignalsTable } from "@/components/signals-table";
import { SignalsFilters } from "@/components/signals-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getSignals(filters?: { sector?: string; search?: string }) {
  let query = db.select().from(tradingSignals);

  if (filters?.sector) {
    query = query.where(like(tradingSignals.sector, `%${filters.sector}%`)) as any;
  }

  if (filters?.search) {
    query = query.where(
      or(
        like(tradingSignals.symbol, `%${filters.search}%`),
        like(tradingSignals.sector, `%${filters.search}%`)
      )!
    ) as any;
  }

  return await query.orderBy(desc(tradingSignals.scrapedAt), tradingSignals.symbol).limit(500);
}

async function getSectors() {
  const sectors = await db
    .selectDistinct({ sector: tradingSignals.sector })
    .from(tradingSignals)
    .where(sql`sector IS NOT NULL`);

  return sectors.map((s) => s.sector).filter(Boolean) as string[];
}

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; search?: string }>;
}) {
  const { sector, search } = await searchParams;
  const signals = await getSignals({
    sector,
    search,
  });
  const sectors = await getSectors();

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
              <div className="text-2xl font-bold">{signals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Symbols</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(signals.map((s) => s.symbol)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(signals.map((s) => s.sector)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {signals[0]?.scrapedAt
                  ? new Date(signals[0].scrapedAt).toLocaleString()
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
