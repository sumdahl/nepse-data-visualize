import { NextResponse } from 'next/server';
import { readJsonl, fileExists, buildHistoricalPath, buildFeaturesPath } from '@/lib/utils/file-utils';
import type { FeaturedSignal } from '@/types/features';

export const dynamic = 'force-dynamic';

async function getLatestFeaturesPath(): Promise<{ path: string; date: string } | null> {
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const path = buildFeaturesPath(process.cwd(), dateStr);
    if (await fileExists(path)) {
      return { path, date: dateStr };
    }
  }
  return null;
}

export async function GET() {
  try {
    const latestFeatures = await getLatestFeaturesPath();
    const today = latestFeatures?.date || new Date().toISOString().slice(0, 10);
    const featuresPath = latestFeatures?.path || buildFeaturesPath(process.cwd(), today);
    const historicalPath = buildHistoricalPath(process.cwd());

    let todaySignals: FeaturedSignal[] = [];
    
    if (await fileExists(featuresPath)) {
      todaySignals = await readJsonl<FeaturedSignal>(featuresPath);
    }

    let historicalSignals: FeaturedSignal[] = [];
    if (await fileExists(historicalPath)) {
      historicalSignals = await readJsonl<FeaturedSignal>(historicalPath);
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

    const dates = [...new Set(historicalSignals.map(s => s.scrape_date))].sort().reverse();
    const latestDate = dates[0] || null;

    return NextResponse.json({
      success: true,
      data: {
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
        latestDate,
        historicalDates: dates.slice(0, 30),
      },
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market overview' },
      { status: 500 }
    );
  }
}
