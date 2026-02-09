import { db } from "@/lib/db";
import { tradingSignals, type TradingSignal } from "@/lib/db/schema";
import { desc, sql, like, or } from "drizzle-orm";

export interface SignalFilters {
  sector?: string;
  search?: string;
  limit?: number;
}

export interface SignalStats {
  total: number;
  uniqueSymbols: number;
  uniqueSectors: number;
  latestUpdate: Date | null;
}

/**
 * Service for managing trading signals
 */
export const signalsService = {
  /**
   * Get trading signals with optional filters
   */
  async getSignals(filters?: SignalFilters): Promise<TradingSignal[]> {
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

    const limit = filters?.limit || 500;
    return await query
      .orderBy(desc(tradingSignals.scrapedAt), tradingSignals.symbol)
      .limit(limit);
  },

  /**
   * Get a single signal by ID
   */
  async getSignalById(id: number): Promise<TradingSignal | null> {
    const results = await db
      .select()
      .from(tradingSignals)
      .where(sql`${tradingSignals.id} = ${id}`)
      .limit(1);
    
    return results[0] || null;
  },

  /**
   * Get signal statistics
   */
  async getSignalStats(signals: TradingSignal[]): Promise<SignalStats> {
    return {
      total: signals.length,
      uniqueSymbols: new Set(signals.map((s) => s.symbol)).size,
      uniqueSectors: new Set(signals.map((s) => s.sector)).size,
      latestUpdate: signals[0]?.scrapedAt || null,
    };
  },

  /**
   * Get list of unique sectors
   */
  async getSectorList(): Promise<string[]> {
    const sectors = await db
      .selectDistinct({ sector: tradingSignals.sector })
      .from(tradingSignals)
      .where(sql`sector IS NOT NULL`);

    return sectors.map((s) => s.sector).filter(Boolean) as string[];
  },
};
