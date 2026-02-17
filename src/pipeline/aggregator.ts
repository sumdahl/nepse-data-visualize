import type { CleanedSignal } from '@/types/cleaned';
import type { FeaturedSignal } from '@/types/features';
import { appendJsonl, writeJsonAtomic, buildCleanedPath, buildFeaturesPath, fileExists, readJsonl } from '@/lib/utils/file-utils';

export interface AggregateResult {
  totalRecords: number;
  uniqueSymbols: number;
  duplicatesRemoved: number;
}

export async function aggregateCleaned(
  basePath: string,
  signals: CleanedSignal[],
  date: string
): Promise<AggregateResult> {
  const uniqueMap = new Map<string, CleanedSignal>();
  let duplicates = 0;
  
  for (const signal of signals) {
    const key = `${signal.symbol}|${signal.scrape_date}`;
    if (uniqueMap.has(key)) {
      duplicates++;
    } else {
      uniqueMap.set(key, signal);
    }
  }
  
  const uniqueSignals = Array.from(uniqueMap.values());
  const path = buildCleanedPath(basePath, date);
  
  await appendJsonl(path, uniqueSignals);
  
  return {
    totalRecords: uniqueSignals.length,
    uniqueSymbols: new Set(uniqueSignals.map(s => s.symbol)).size,
    duplicatesRemoved: duplicates,
  };
}

export async function aggregateFeatures(
  basePath: string,
  signals: FeaturedSignal[],
  date: string
): Promise<string> {
  const uniqueMap = new Map<string, FeaturedSignal>();
  
  for (const signal of signals) {
    const key = `${signal.symbol}|${signal.scrape_date}`;
    uniqueMap.set(key, signal);
  }
  
  const uniqueSignals = Array.from(uniqueMap.values());
  const path = buildFeaturesPath(basePath, date);
  
  await appendJsonl(path, uniqueSignals);
  
  return path;
}

export async function isAlreadyProcessed(basePath: string, date: string): Promise<boolean> {
  const cleanedPath = buildCleanedPath(basePath, date);
  return fileExists(cleanedPath);
}

export async function getCleanedRecords(basePath: string, date: string): Promise<CleanedSignal[]> {
  const path = buildCleanedPath(basePath, date);
  
  if (!await fileExists(path)) {
    return [];
  }
  
  return readJsonl<CleanedSignal>(path);
}