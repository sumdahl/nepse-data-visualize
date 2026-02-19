import { readJsonl, fileExists, buildHistoricalPath, buildFeaturesPath } from '@/lib/utils/file-utils';
import type { FeaturedSignal } from '@/types/features';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

/** Deduplicate signals by symbol, keeping the first occurrence */
function deduplicateBySymbol(signals: FeaturedSignal[]): FeaturedSignal[] {
  const seen = new Set<string>();
  return signals.filter((s) => {
    if (seen.has(s.symbol)) return false;
    seen.add(s.symbol);
    return true;
  });
}

async function getLatestFeaturesDate(): Promise<string | null> {
  try {
    const baseDir = join(process.cwd(), 'data', 'features', 'nepse');
    const years = await readdir(baseDir);
    
    for (const year of years.sort().reverse()) {
      const months = await readdir(join(baseDir, year));
      for (const month of months.sort().reverse()) {
        const files = await readdir(join(baseDir, year, month));
        for (const file of files.sort().reverse()) {
          const match = file.match(/features_(\d{4}-\d{2}-\d{2})\.jsonl/);
          if (match) return match[1];
        }
      }
    }
  } catch {}
  return null;
}

export async function getMarketOverview() {
  const latestDate = await getLatestFeaturesDate();
  const today = latestDate || new Date().toISOString().slice(0, 10);
  const featuresPath = buildFeaturesPath(process.cwd(), today);
  const historicalPath = buildHistoricalPath(process.cwd());

  let todaySignals: FeaturedSignal[] = [];
  
  if (await fileExists(featuresPath)) {
    todaySignals = deduplicateBySymbol(await readJsonl<FeaturedSignal>(featuresPath));
  }

  const overboughtCount = todaySignals.filter(s => s.is_overbought).length;
  const oversoldCount = todaySignals.filter(s => s.is_oversold).length;
  const bullishCount = todaySignals.filter(s => s.signal_composite > 25).length;
  const bearishCount = todaySignals.filter(s => s.signal_composite < -25).length;

  const avgMomentum = todaySignals.length > 0
    ? todaySignals.reduce((sum, s) => sum + s.momentum_score, 0) / todaySignals.length
    : 0;

  const avgRsi = todaySignals.length > 0
    ? todaySignals.reduce((sum, s) => sum + s.rsi_14, 0) / todaySignals.length
    : 0;

  const sectorStats = todaySignals.reduce((acc, s) => {
    if (!acc[s.sector]) {
      acc[s.sector] = { count: 0, totalMomentum: 0, totalLtp: 0 };
    }
    acc[s.sector].count++;
    acc[s.sector].totalMomentum += s.momentum_score;
    acc[s.sector].totalLtp += s.ltp;
    return acc;
  }, {} as Record<string, { count: number; totalMomentum: number; totalLtp: number }>);

  const sectors = Object.entries(sectorStats).map(([sector, stats]) => ({
    sector,
    count: stats.count,
    avgMomentum: stats.totalMomentum / stats.count,
    avgLtp: stats.totalLtp / stats.count,
  })).sort((a, b) => b.count - a.count);

  const topGainers = [...todaySignals]
    .sort((a, b) => b.daily_gain_pct - a.daily_gain_pct)
    .slice(0, 5);

  const topLosers = [...todaySignals]
    .sort((a, b) => a.daily_gain_pct - b.daily_gain_pct)
    .slice(0, 5);

  const topMomentum = [...todaySignals]
    .sort((a, b) => b.momentum_score - a.momentum_score)
    .slice(0, 5);

  return {
    totalSignals: todaySignals.length,
    totalSymbols: new Set(todaySignals.map(s => s.symbol)).size,
    overboughtCount,
    oversoldCount,
    bullishCount,
    bearishCount,
    avgMomentum,
    avgRsi,
    sectors,
    topGainers,
    topLosers,
    topMomentum,
    latestDate: today,
  };
}

export async function getFeaturedSignals(options: {
  sector?: string;
  symbol?: string;
  rsiZone?: string;
  sentiment?: string;
  limit?: number;
  date?: string;
} = {}) {
  const { sector, symbol, rsiZone, limit = 500, date } = options;

  const targetDate = date || await getLatestFeaturesDate() || new Date().toISOString().slice(0, 10);
  const featuresPath = buildFeaturesPath(process.cwd(), targetDate);
  
  if (!await fileExists(featuresPath)) {
    return [];
  }

  let signals = deduplicateBySymbol(await readJsonl<FeaturedSignal>(featuresPath));

  if (sector && sector !== 'all') {
    signals = signals.filter(s => s.sector.toLowerCase().includes(sector.toLowerCase()));
  }

  if (symbol) {
    signals = signals.filter(s => s.symbol.toLowerCase().includes(symbol.toLowerCase()));
  }

  if (rsiZone && rsiZone !== 'all') {
    signals = signals.filter(s => s.rsi_zone === rsiZone);
  }

  return signals
    .sort((a, b) => b.signal_composite - a.signal_composite)
    .slice(0, limit);
}

export async function getStockData(symbol: string, days: number = 30) {
  const historicalPath = buildHistoricalPath(process.cwd());

  if (!await fileExists(historicalPath)) {
    return null;
  }

  const allRecords = await readJsonl<FeaturedSignal>(historicalPath);
  const symbolRecords = allRecords
    .filter(r => r.symbol === symbol.toUpperCase())
    .sort((a, b) => b.scrape_date.localeCompare(a.scrape_date));

  if (symbolRecords.length === 0) {
    return null;
  }

  const latest = symbolRecords[0];
  const history = symbolRecords.slice(0, days);

  const priceHistory = history.map(r => ({
    date: r.scrape_date,
    ltp: r.ltp,
    daily_gain_pct: r.daily_gain_pct,
  })).reverse();

  const momentumHistory = history.map(r => ({
    date: r.scrape_date,
    momentum_score: r.momentum_score,
    signal_composite: r.signal_composite,
    rsi_14: r.rsi_14,
  })).reverse();

  const stats = {
    total_records: symbolRecords.length,
    date_range: {
      start: symbolRecords[symbolRecords.length - 1]?.scrape_date,
      end: latest.scrape_date,
    },
    avg_momentum: symbolRecords.reduce((sum, r) => sum + r.momentum_score, 0) / symbolRecords.length,
    avg_rsi: symbolRecords.reduce((sum, r) => sum + r.rsi_14, 0) / symbolRecords.length,
    price_change_pct: symbolRecords.length > 1
      ? ((latest.ltp - symbolRecords[symbolRecords.length - 1].ltp) / symbolRecords[symbolRecords.length - 1].ltp) * 100
      : 0,
  };

  return {
    symbol: symbol.toUpperCase(),
    latest,
    history: history.slice(0, days),
    priceHistory,
    momentumHistory,
    stats,
  };
}

export async function getHistoricalStats() {
  const historicalPath = buildHistoricalPath(process.cwd());

  if (!await fileExists(historicalPath)) {
    return {
      totalRecords: 0,
      uniqueSymbols: 0,
      dateRange: { start: '', end: '' },
      sectors: [],
    };
  }

  const records = await readJsonl<FeaturedSignal>(historicalPath);
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

export async function getSectorList(): Promise<string[]> {
  const data = await getMarketOverview();
  return data.sectors.map(s => s.sector);
}
