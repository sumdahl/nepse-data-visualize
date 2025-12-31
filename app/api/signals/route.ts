import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tradingSignals } from "@/lib/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sector = searchParams.get("sector");
    const symbol = searchParams.get("symbol");

    let query = db.select().from(tradingSignals);

    if (sector) {
      query = query.where(eq(tradingSignals.sector, sector)) as any;
    }

    if (symbol) {
      query = query.where(eq(tradingSignals.symbol, symbol)) as any;
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

