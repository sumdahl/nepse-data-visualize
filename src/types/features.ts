import { CleanedSignal } from './cleaned.js';

export type RSIZone = 'oversold' | 'neutral' | 'overbought';
export type MACDZone = 'bearish' | 'neutral' | 'bullish';

export interface FeaturedSignal extends CleanedSignal {
  momentum_score: number;
  volatility_ratio: number;
  is_overbought: boolean;
  is_oversold: boolean;
  trend_strength: number;
  ma_alignment_score: number;
  signal_composite: number;
  rsi_zone: RSIZone;
  macd_zone: MACDZone;
}

export interface DailyFeatureStats {
  scrape_date: string;
  total_records: number;
  avg_momentum: number;
  avg_volatility_ratio: number;
  overbought_count: number;
  oversold_count: number;
  bullish_count: number;
  bearish_count: number;
}