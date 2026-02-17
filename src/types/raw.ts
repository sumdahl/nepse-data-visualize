export interface RawSignal {
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
  scrapedAt: string;
  scrapeDate?: string;
}

export interface RawMetadata {
  totalRecords: number;
  scrapedAt: string;
  scrapeDate: string;
  source: string;
  version: string;
}

export interface RawFile {
  metadata: RawMetadata;
  records: RawSignal[];
}