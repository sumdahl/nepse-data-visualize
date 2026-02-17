import type { FeaturedSignal, HistoricalQueryOptions } from '@/types/index';
import { appendJsonl, readJsonl, fileExists, buildHistoricalPath } from '@/lib/utils/file-utils';

export interface HistoricalStats {
  totalRecords: number;
  uniqueSymbols: number;
  dateRange: { start: string; end: string };
  sectors: string[];
}

export async function appendToHistorical(
  basePath: string,
  signals: FeaturedSignal[]
): Promise<{ added: number; skipped: number }> {
  const path = buildHistoricalPath(basePath);
  let existingKeys: Set<string>;
  
  if (await fileExists(path)) {
    const existing = await readJsonl<FeaturedSignal>(path);
    existingKeys = new Set(existing.map(s => `${s.symbol}|${s.scrape_date}`));
  } else {
    existingKeys = new Set();
  }
  
  const newRecords = signals.filter(s => {
    const key = `${s.symbol}|${s.scrape_date}`;
    return !existingKeys.has(key);
  });
  
  if (newRecords.length === 0) {
    return { added: 0, skipped: signals.length };
  }
  
  await appendJsonl(path, newRecords);
  
  return { added: newRecords.length, skipped: signals.length - newRecords.length };
}

export async function queryHistorical(
  basePath: string,
  options: HistoricalQueryOptions = {}
): Promise<FeaturedSignal[]> {
  const path = buildHistoricalPath(basePath);
  
  if (!await fileExists(path)) {
    return [];
  }
  
  const allRecords = await readJsonl<FeaturedSignal>(path);
  let filtered = allRecords;
  
  if (options.symbol) {
    const sym = options.symbol.toUpperCase();
    filtered = filtered.filter(s => s.symbol === sym);
  }
  
  if (options.sector) {
    const sec = options.sector;
    filtered = filtered.filter(s => s.sector === sec);
  }
  
  if (options.startDate) {
    const start = options.startDate;
    filtered = filtered.filter(s => s.scrape_date >= start);
  }
  
  if (options.endDate) {
    const end = options.endDate;
    filtered = filtered.filter(s => s.scrape_date <= end);
  }
  
  filtered.sort((a, b) => a.scrape_date.localeCompare(b.scrape_date));
  
  if (options.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
}

export async function getHistoricalStats(basePath: string): Promise<HistoricalStats> {
  const path = buildHistoricalPath(basePath);
  
  if (!await fileExists(path)) {
    return {
      totalRecords: 0,
      uniqueSymbols: 0,
      dateRange: { start: '', end: '' },
      sectors: [],
    };
  }
  
  const records = await readJsonl<FeaturedSignal>(path);
  const symbols = new Set(records.map(s => s.symbol));
  const sectors = [...new Set(records.map(s => s.sector))];
  const dates = records.map(s => s.scrape_date).sort();
  
  return {
    totalRecords: records.length,
    uniqueSymbols: symbols.size,
    dateRange: {
      start: dates[0] || '',
      end: dates[dates.length - 1] || '',
    },
    sectors,
  };
}

export async function getSymbolHistory(
  basePath: string,
  symbol: string,
  limit?: number
): Promise<FeaturedSignal[]> {
  return queryHistorical(basePath, { symbol, limit, endDate: undefined, startDate: undefined, sector: undefined });
}

export async function getLatestRecords(basePath: string, limit: number = 100): Promise<FeaturedSignal[]> {
  const path = buildHistoricalPath(basePath);
  
  if (!await fileExists(path)) {
    return [];
  }
  
  const allRecords = await readJsonl<FeaturedSignal>(path);
  
  const dateMap = new Map<string, FeaturedSignal[]>();
  for (const record of allRecords) {
    if (!dateMap.has(record.scrape_date)) {
      dateMap.set(record.scrape_date, []);
    }
    dateMap.get(record.scrape_date)!.push(record);
  }
  
  const sortedDates = [...dateMap.keys()].sort().reverse();
  const latestDate = sortedDates[0];
  
  if (!latestDate) return [];
  
  return dateMap.get(latestDate)!.slice(0, limit);
}