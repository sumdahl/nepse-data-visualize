import type { RawSignal } from '@/types/raw';
import type { CleanedSignal, Trend3MValue } from '@/types/cleaned';
import { parsePercentage, toFixed } from '@/lib/utils/parsers';

export function normalizeSignal(signal: RawSignal): CleanedSignal {
  const scrapeDate = signal.scrapeDate || signal.scrapedAt.slice(0, 10);
  
  return {
    symbol: signal.symbol.trim().toUpperCase(),
    scrape_date: scrapeDate,
    scrape_timestamp: signal.scrapedAt,
    sector: signal.sector.trim(),
    
    ltp: toFixed(signal.ltp, 2),
    daily_gain_pct: toFixed(parsePercentage(signal.dailyGain), 4),
    daily_volatility_pct: toFixed(parsePercentage(signal.dailyVolatility), 4),
    price_relative_pct: toFixed(parsePercentage(signal.priceRelative), 4),
    
    trend_3m: signal.trend3M as Trend3MValue,
    
    rsi_14: toFixed(signal.rsi14, 2),
    macd_signal: 0,
    percent_b: toFixed(parsePercentage(signal.percentB), 2),
    mfi_14: toFixed(signal.mfi14, 2),
    sto_14: toFixed(signal.sto14, 2),
    cci_14: toFixed(signal.cci14, 2),
    stoch_rsi: toFixed(signal.stochRSI, 2),
    
    price_above_sma10: false,
    price_above_sma20: false,
    price_above_sma50: false,
    price_above_sma200: false,
    sma5_above_sma20: 0,
    sma50_vs_sma200: 0,
    
    volume_trend: 0,
    beta_3m: toFixed(signal.beta3Month, 2),
    
    technical_summary: 0,
    technical_risk: 1,
  };
}

export function normalizeSignals(signals: RawSignal[]): CleanedSignal[] {
  return signals.map(normalizeSignal);
}