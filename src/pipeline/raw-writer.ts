import type { RawSignal, RawFile, RawMetadata } from '@/types/raw';
import { writeJsonAtomic, buildRawPath } from '@/lib/utils/file-utils';
import { timestamp, timeOnly } from '@/lib/utils/parsers';

const RAW_VERSION = '1.0.0';
const SOURCE = 'nepsealpha.com';

export interface WriteRawResult {
  path: string;
  recordCount: number;
  timestamp: string;
}

export async function writeRaw(
  basePath: string,
  records: RawSignal[],
  date?: string,
  source?: string
): Promise<WriteRawResult> {
  const scrapedAt = timestamp();
  const scrapeDate = date || scrapedAt.slice(0, 10);
  const time = timeOnly();
  
  const metadata: RawMetadata = {
    totalRecords: records.length,
    scrapedAt,
    scrapeDate,
    source: source || SOURCE,
    version: RAW_VERSION,
  };
  
  const rawFile: RawFile = { metadata, records };
  const path = buildRawPath(basePath, scrapeDate, time);
  
  await writeJsonAtomic(path, rawFile);
  
  return {
    path,
    recordCount: records.length,
    timestamp: scrapedAt,
  };
}

export function createRawSignal(data: Partial<RawSignal>): RawSignal {
  const now = timestamp();
  const today = now.slice(0, 10);
  
  return {
    symbol: data.symbol || '',
    technicalSummary: data.technicalSummary || '',
    technicalEntryRisk: data.technicalEntryRisk || '',
    sector: data.sector || '',
    dailyGain: data.dailyGain || '0%',
    ltp: data.ltp || 0,
    dailyVolatility: data.dailyVolatility || '0%',
    priceRelative: data.priceRelative || '0%',
    trend3M: data.trend3M || 'MEAN REVERTING',
    rsi14: data.rsi14 || 0,
    macdVsSignalLine: data.macdVsSignalLine || 'Neutral',
    percentB: data.percentB || '0%',
    mfi14: data.mfi14 || 0,
    sto14: data.sto14 || 0,
    cci14: data.cci14 || 0,
    stochRSI: data.stochRSI || 0,
    sma10: data.sma10 || '',
    priceAbove20SMA: data.priceAbove20SMA || '',
    priceAbove50SMA: data.priceAbove50SMA || '',
    priceAbove200SMA: data.priceAbove200SMA || '',
    sma5Above20SMA: data.sma5Above20SMA || 'Neutral',
    sma50_200: data.sma50_200 || 'Neutral',
    volumeTrend: data.volumeTrend || 'Neutral',
    beta3Month: data.beta3Month || 1,
    scrapedAt: data.scrapedAt || now,
    scrapeDate: data.scrapeDate || today,
  };
}