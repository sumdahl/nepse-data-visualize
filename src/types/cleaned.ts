export type SentimentValue = -2 | -1 | -0.5 | 0 | 0.5 | 1 | 2;
export type TrendValue = -1 | 0 | 1;
export type RiskValue = 0 | 1 | 2;
export type Trend3MValue = 'TRENDING' | 'MEAN REVERTING';

export interface CleanedSignal {
  symbol: string;
  scrape_date: string;
  scrape_timestamp: string;
  sector: string;
  ltp: number;
  daily_gain_pct: number;
  daily_volatility_pct: number;
  price_relative_pct: number;
  trend_3m: Trend3MValue;
  rsi_14: number;
  macd_signal: TrendValue;
  percent_b: number;
  mfi_14: number;
  sto_14: number;
  cci_14: number;
  stoch_rsi: number;
  price_above_sma10: boolean;
  price_above_sma20: boolean;
  price_above_sma50: boolean;
  price_above_sma200: boolean;
  sma5_above_sma20: TrendValue;
  sma50_vs_sma200: TrendValue;
  volume_trend: TrendValue;
  beta_3m: number;
  technical_summary: SentimentValue;
  technical_risk: RiskValue;
}