export interface TradingSignal {
  symbol: string;
  technicalSummary: string;
  technicalEntryRisk: string;
  sector: string;
  dailyGain: string;
  ltp: number;
  dailyVolatility: string;
  priceRelative: string;
  trend3M: string;
  rsi14: number;
  macdVsSignalLine: string;
  percentB: string;
  mfi14: number;
  sto14: number;
  cci14: number;
  stochRSI: number;
  sma10: string;
  priceAbove20SMA: string;
  priceAbove50SMA: string;
  priceAbove200SMA: string;
  sma5Above20SMA: string;
  sma50_200: string;
  volumeTrend: string;
  beta3Month: number;
  scrapedAt?: Date;
}

export interface DatabaseSignal {
  id: number;
  symbol: string;
  technical_summary: string;
  technical_entry_risk: string;
  sector: string;
  daily_gain: string;
  ltp: number;
  daily_volatility: string;
  price_relative: string;
  trend_3m: string;
  rsi_14: number;
  macd_vs_signal_line: string;
  percent_b: string;
  mfi_14: number;
  sto_14: number;
  cci_14: number;
  stoch_rsi: number;
  sma_10: string;
  price_above_20_sma: string;
  price_above_50_sma: string;
  price_above_200_sma: string;
  sma_5_above_20_sma: string;
  sma_50_200: string;
  volume_trend: string;
  beta_3_month: number;
  scraped_at: Date;
}

