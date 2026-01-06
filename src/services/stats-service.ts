import { db } from "@/lib/db";
import { tradingSignals } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

export interface DashboardStats {
  total: number;
  latestScrape: Date | null;
  sectors: {
    sector: string;
    count: number;
    avgLtp: number;
  }[];
  summaries: {
    summary: string;
    count: number;
  }[];
  risks: {
    risk: string;
    count: number;
  }[];
  topPerformers: typeof tradingSignals.$inferSelect[];
}

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [totalSignals, latestSignals, sectorStats, summaryStats, riskStats, topPerformers] = await Promise.all([
        // 1. Total count
        db.select({ count: sql<number>`count(*)` }).from(tradingSignals),
        
        // 2. Latest scrape time
        db.select().from(tradingSignals).orderBy(desc(tradingSignals.scrapedAt)).limit(1),
        
        // 3. Sector stats
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
          
        // 4. Summary stats
        db
          .select({
            summary: tradingSignals.technicalSummary,
            count: sql<number>`count(*)`,
          })
          .from(tradingSignals)
          .groupBy(tradingSignals.technicalSummary)
          .orderBy(desc(sql<number>`count(*)`)),
          
        // 5. Risk stats
        db
          .select({
            risk: tradingSignals.technicalEntryRisk,
            count: sql<number>`count(*)`,
          })
          .from(tradingSignals)
          .groupBy(tradingSignals.technicalEntryRisk)
          .orderBy(desc(sql<number>`count(*)`)),
          
        // 6. Top performers
        db
          .select()
          .from(tradingSignals)
          .where(sql`cast(replace(replace(daily_gain, '%', ''), ',', '') as numeric) > 0`)
          .orderBy(desc(sql`cast(replace(replace(daily_gain, '%', ''), ',', '') as numeric)`))
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
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return empty stats on error to prevent page crash
      return {
        total: 0,
        latestScrape: null,
        sectors: [],
        summaries: [],
        risks: [],
        topPerformers: [],
      };
    }
  }
};
