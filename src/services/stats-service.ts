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

export interface AnalysisData {
  sectors: {
    sector: string;
    count: number;
    avgLtp: number;
    avgGain: number;
  }[];
  summaries: {
    summary: string;
    count: number;
  }[];
  risks: {
    risk: string;
    count: number;
  }[];
  topGainers: typeof tradingSignals.$inferSelect[];
  topLosers: typeof tradingSignals.$inferSelect[];
  rsiDistribution: {
    range: string;
    count: number;
  }[];
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
  },

  async getAnalysisData(): Promise<AnalysisData> {
    try {
      const [sectorStats, summaryStats, riskStats, topGainers, topLosers, rsiDistribution] = await Promise.all([
        // 1. Sector stats with average gain
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
        
        // 2. Summary stats
        db
          .select({
            summary: tradingSignals.technicalSummary,
            count: sql<number>`count(*)`,
          })
          .from(tradingSignals)
          .groupBy(tradingSignals.technicalSummary)
          .orderBy(desc(sql<number>`count(*)`)),
        
        // 3. Risk stats
        db
          .select({
            risk: tradingSignals.technicalEntryRisk,
            count: sql<number>`count(*)`,
          })
          .from(tradingSignals)
          .groupBy(tradingSignals.technicalEntryRisk)
          .orderBy(desc(sql<number>`count(*)`)),
        
        // 4. Top gainers
        db
          .select()
          .from(tradingSignals)
          .where(sql`cast(replace(daily_gain, '%', '') as numeric) > 0`)
          .orderBy(desc(sql`cast(replace(daily_gain, '%', '') as numeric)`))
          .limit(10),
        
        // 5. Top losers
        db
          .select()
          .from(tradingSignals)
          .where(sql`cast(replace(daily_gain, '%', '') as numeric) < 0`)
          .orderBy(sql`cast(replace(daily_gain, '%', '') as numeric)`)
          .limit(10),
        
        // 6. RSI distribution
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
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      return {
        sectors: [],
        summaries: [],
        risks: [],
        topGainers: [],
        topLosers: [],
        rsiDistribution: [],
      };
    }
  },
};
