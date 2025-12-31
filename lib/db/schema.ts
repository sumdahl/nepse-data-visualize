import { pgTable, serial, varchar, decimal, timestamp, index, unique } from "drizzle-orm/pg-core";

export const tradingSignals = pgTable(
  "trading_signals",
  {
    id: serial("id").primaryKey(),
    symbol: varchar("symbol", { length: 20 }).notNull(),
    technicalSummary: varchar("technical_summary", { length: 50 }),
    technicalEntryRisk: varchar("technical_entry_risk", { length: 50 }),
    sector: varchar("sector", { length: 100 }),
    dailyGain: varchar("daily_gain", { length: 20 }),
    ltp: decimal("ltp", { precision: 10, scale: 2 }),
    dailyVolatility: varchar("daily_volatility", { length: 20 }),
    priceRelative: varchar("price_relative", { length: 20 }),
    trend3M: varchar("trend_3m", { length: 50 }),
    rsi14: decimal("rsi_14", { precision: 10, scale: 2 }),
    macdVsSignalLine: varchar("macd_vs_signal_line", { length: 50 }),
    percentB: varchar("percent_b", { length: 20 }),
    mfi14: decimal("mfi_14", { precision: 10, scale: 2 }),
    sto14: decimal("sto_14", { precision: 10, scale: 2 }),
    cci14: decimal("cci_14", { precision: 10, scale: 2 }),
    stochRSI: decimal("stoch_rsi", { precision: 10, scale: 2 }),
    sma10: varchar("sma_10", { length: 100 }),
    priceAbove20SMA: varchar("price_above_20_sma", { length: 100 }),
    priceAbove50SMA: varchar("price_above_50_sma", { length: 100 }),
    priceAbove200SMA: varchar("price_above_200_sma", { length: 100 }),
    sma5Above20SMA: varchar("sma_5_above_20_sma", { length: 50 }),
    sma50_200: varchar("sma_50_200", { length: 50 }),
    volumeTrend: varchar("volume_trend", { length: 50 }),
    beta3Month: decimal("beta_3_month", { precision: 10, scale: 2 }),
    scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  },
  (table) => ({
    symbolIdx: index("idx_symbol").on(table.symbol),
    scrapedAtIdx: index("idx_scraped_at").on(table.scrapedAt),
    sectorIdx: index("idx_sector").on(table.sector),
    uniqueSymbolScrapedAt: unique("unique_symbol_scraped_at").on(table.symbol, table.scrapedAt),
  })
);

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type NewTradingSignal = typeof tradingSignals.$inferInsert;

