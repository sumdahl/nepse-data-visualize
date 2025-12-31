import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tradingSignals } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tradingSignals);

    const sectorStats = await db
      .select({
        sector: tradingSignals.sector,
        count: sql<number>`count(*)`,
      })
      .from(tradingSignals)
      .groupBy(tradingSignals.sector)
      .orderBy(desc(sql<number>`count(*)`));

    const summaryStats = await db
      .select({
        summary: tradingSignals.technicalSummary,
        count: sql<number>`count(*)`,
      })
      .from(tradingSignals)
      .groupBy(tradingSignals.technicalSummary)
      .orderBy(desc(sql<number>`count(*)`));

    const latestScrape = await db
      .select({
        scrapedAt: tradingSignals.scrapedAt,
      })
      .from(tradingSignals)
      .orderBy(desc(tradingSignals.scrapedAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        total: Number(totalResult?.count || 0),
        bySector: sectorStats.map((s) => ({
          sector: s.sector,
          count: Number(s.count),
        })),
        bySummary: summaryStats.map((s) => ({
          summary: s.summary,
          count: Number(s.count),
        })),
        latestScrape: latestScrape[0]?.scrapedAt || null,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

