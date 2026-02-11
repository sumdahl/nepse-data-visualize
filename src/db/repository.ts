// This file is kept for backward compatibility with the scraper script
// For Next.js app, use src/lib/db/index.ts instead
import postgres from "postgres";
import { config } from "../config/index.js";
import { TradingSignal, DatabaseSignal } from "../types/index.js";
import { toDatabaseFormat } from "../utils/transform.js";

if (!config.database.connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const user = parsed.username ? `${parsed.username}` : "";
    const host = parsed.host || "";
    const db = parsed.pathname ? parsed.pathname.replace(/^\//, "") : "";
    return `${parsed.protocol}//${user ? `${user}@` : ""}${host}/${db}`;
  } catch {
    return "invalid DATABASE_URL";
  }
}

// Create PostgreSQL connection (works with Supabase, Neon, or any PostgreSQL)
const sql = postgres(config.database.connectionString, {
  max: 1, // Use single connection for serverless
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require',
});

export class TradingSignalRepository {
  async hasSuccessfulRunForDate(date: string): Promise<boolean> {
    const results = await sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM scrape_runs
      WHERE status = 'success'
        AND scraped_at::date = ${date}::date
    `;
    return (results[0]?.count || 0) > 0;
  }

  async createScrapeRun(params: {
    scrapedAt: Date;
    sourceUrl: string;
    status: "started" | "success" | "failed";
  }): Promise<number> {
    const result = await sql<{ id: number }[]>`
      INSERT INTO scrape_runs (scraped_at, source_url, status)
      VALUES (${params.scrapedAt}, ${params.sourceUrl}, ${params.status})
      RETURNING id
    `;
    return result[0].id;
  }

  async finishScrapeRun(params: {
    id: number;
    status: "success" | "failed";
    rowCount: number;
    durationMs: number;
    error?: string | null;
  }): Promise<void> {
    await sql`
      UPDATE scrape_runs
      SET status = ${params.status},
          row_count = ${params.rowCount},
          duration_ms = ${params.durationMs},
          error = ${params.error || null}
      WHERE id = ${params.id}
    `;
  }

  /**
   * Insert or update trading signals
   */
  async upsertSignals(signals: TradingSignal[], scrapeRunId: number): Promise<void> {
    if (signals.length === 0) return;

    console.log(`Upserting ${signals.length} signals...`);
    console.log(`Database target: ${maskDatabaseUrl(config.database.connectionString)}`);

    // Process in batches to avoid overwhelming the database
    const batchSize = 50;
    let successCount = 0;
    let failureCount = 0;
    let firstError: unknown = null;
    for (let i = 0; i < signals.length; i += batchSize) {
      const batch = signals.slice(i, i + batchSize);
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(signals.length / batchSize)}...`);

      for (const signal of batch) {
        const dbSignal = toDatabaseFormat(signal);
        
        try {
          await sql`
            INSERT INTO trading_signals (
              symbol, technical_summary, technical_entry_risk, sector, daily_gain, ltp,
              daily_volatility, price_relative, trend_3m, rsi_14, macd_vs_signal_line,
              percent_b, mfi_14, sto_14, cci_14, stoch_rsi, sma_10, price_above_20_sma,
              price_above_50_sma, price_above_200_sma, sma_5_above_20_sma, sma_50_200,
              volume_trend, beta_3_month, scraped_at, scrape_date, scrape_run_id
            ) VALUES (
              ${dbSignal.symbol}, ${dbSignal.technical_summary}, ${dbSignal.technical_entry_risk},
              ${dbSignal.sector}, ${dbSignal.daily_gain}, ${dbSignal.ltp}, ${dbSignal.daily_volatility},
              ${dbSignal.price_relative}, ${dbSignal.trend_3m}, ${dbSignal.rsi_14}, ${dbSignal.macd_vs_signal_line},
              ${dbSignal.percent_b}, ${dbSignal.mfi_14}, ${dbSignal.sto_14}, ${dbSignal.cci_14},
              ${dbSignal.stoch_rsi}, ${dbSignal.sma_10}, ${dbSignal.price_above_20_sma},
              ${dbSignal.price_above_50_sma}, ${dbSignal.price_above_200_sma}, ${dbSignal.sma_5_above_20_sma},
              ${dbSignal.sma_50_200}, ${dbSignal.volume_trend}, ${dbSignal.beta_3_month}, ${dbSignal.scraped_at},
              ${dbSignal.scrape_date},
              ${scrapeRunId}
            )
            ON CONFLICT (symbol, scrape_date) DO UPDATE SET
              technical_summary = EXCLUDED.technical_summary,
              technical_entry_risk = EXCLUDED.technical_entry_risk,
              sector = EXCLUDED.sector,
              daily_gain = EXCLUDED.daily_gain,
              ltp = EXCLUDED.ltp,
              daily_volatility = EXCLUDED.daily_volatility,
              price_relative = EXCLUDED.price_relative,
              trend_3m = EXCLUDED.trend_3m,
              rsi_14 = EXCLUDED.rsi_14,
              macd_vs_signal_line = EXCLUDED.macd_vs_signal_line,
              percent_b = EXCLUDED.percent_b,
              mfi_14 = EXCLUDED.mfi_14,
              sto_14 = EXCLUDED.sto_14,
              cci_14 = EXCLUDED.cci_14,
              stoch_rsi = EXCLUDED.stoch_rsi,
              sma_10 = EXCLUDED.sma_10,
              price_above_20_sma = EXCLUDED.price_above_20_sma,
              price_above_50_sma = EXCLUDED.price_above_50_sma,
              price_above_200_sma = EXCLUDED.price_above_200_sma,
              sma_5_above_20_sma = EXCLUDED.sma_5_above_20_sma,
              sma_50_200 = EXCLUDED.sma_50_200,
              volume_trend = EXCLUDED.volume_trend,
              beta_3_month = EXCLUDED.beta_3_month,
              scraped_at = EXCLUDED.scraped_at,
              scrape_run_id = EXCLUDED.scrape_run_id
          `;
          successCount += 1;
        } catch (error) {
          failureCount += 1;
          if (!firstError) {
            firstError = error;
          }
          console.error(`   ⚠️  Error upserting signal ${signal.symbol}:`, error);
          // Continue with next signal
        }
      }
    }

    console.log(`✅ Successfully upserted signals`);
    console.log(`   • Successful: ${successCount}`);
    console.log(`   • Failed: ${failureCount}`);

    if (successCount === 0) {
      throw new Error(`All upserts failed. First error: ${firstError instanceof Error ? firstError.message : String(firstError)}`);
    }
  }

  /**
   * Get all signals, optionally filtered by date
   */
  async getAllSignals(limit: number = 1000, offset: number = 0): Promise<TradingSignal[]> {
    const results = await sql<DatabaseSignal[]>`
      SELECT * FROM trading_signals
      ORDER BY scraped_at DESC, symbol ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return results.map(this.fromDatabaseFormat);
  }

  /**
   * Get latest signals for all symbols
   */
  async getLatestSignals(): Promise<TradingSignal[]> {
    const results = await sql<DatabaseSignal[]>`
      SELECT DISTINCT ON (symbol) *
      FROM trading_signals
      ORDER BY symbol, scraped_at DESC
    `;
    return results.map(this.fromDatabaseFormat);
  }

  /**
   * Get signals for a given date (YYYY-MM-DD). Uses the latest run on that day.
   */
  async getSignalsForDate(date: string): Promise<TradingSignal[]> {
    const results = await sql<DatabaseSignal[]>`
      SELECT *
      FROM trading_signals
      WHERE scrape_date = ${date}::date
      ORDER BY symbol ASC
    `;
    return results.map(this.fromDatabaseFormat);
  }

  /**
   * Convert DatabaseSignal to TradingSignal
   */
  private fromDatabaseFormat(dbSignal: DatabaseSignal): TradingSignal {
    return {
      symbol: dbSignal.symbol,
      technicalSummary: dbSignal.technical_summary,
      technicalEntryRisk: dbSignal.technical_entry_risk,
      sector: dbSignal.sector,
      dailyGain: dbSignal.daily_gain,
      ltp: dbSignal.ltp,
      dailyVolatility: dbSignal.daily_volatility,
      priceRelative: dbSignal.price_relative,
      trend3M: dbSignal.trend_3m,
      rsi14: dbSignal.rsi_14,
      macdVsSignalLine: dbSignal.macd_vs_signal_line,
      percentB: dbSignal.percent_b,
      mfi14: dbSignal.mfi_14,
      sto14: dbSignal.sto_14,
      cci14: dbSignal.cci_14,
      stochRSI: dbSignal.stoch_rsi,
      sma10: dbSignal.sma_10,
      priceAbove20SMA: dbSignal.price_above_20_sma,
      priceAbove50SMA: dbSignal.price_above_50_sma,
      priceAbove200SMA: dbSignal.price_above_200_sma,
      sma5Above20SMA: dbSignal.sma_5_above_20_sma,
      sma50_200: dbSignal.sma_50_200,
      volumeTrend: dbSignal.volume_trend,
      beta3Month: dbSignal.beta_3_month,
      scrapedAt: dbSignal.scraped_at,
      scrapeDate: dbSignal.scrape_date
    };
  }
}
