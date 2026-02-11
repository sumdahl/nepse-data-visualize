import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tradingSignals, scrapeRuns } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sector = searchParams.get("sector");
    const symbol = searchParams.get("symbol");
    const date = searchParams.get("date"); // YYYY-MM-DD

    let query = db.select().from(tradingSignals);

    if (sector) {
      query = query.where(eq(tradingSignals.sector, sector)) as any;
    }

    if (symbol) {
      query = query.where(eq(tradingSignals.symbol, symbol)) as any;
    }

    if (date) {
      const runs = await db
        .select({ id: scrapeRuns.id })
        .from(scrapeRuns)
        .where(sql`DATE(${scrapeRuns.scrapedAt}) = ${date}`)
        .orderBy(desc(scrapeRuns.scrapedAt))
        .limit(1);

      const runId = runs[0]?.id;
      if (!runId) {
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
        });
      }

      query = query.where(eq(tradingSignals.scrapeRunId, runId)) as any;
    }

    const signals = await query
      .orderBy(desc(tradingSignals.scrapedAt), tradingSignals.symbol)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: signals,
      count: signals.length,
    });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}
