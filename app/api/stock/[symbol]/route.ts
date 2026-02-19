import { NextResponse } from 'next/server';
import { readJsonl, fileExists, buildHistoricalPath, buildFeaturesPath } from '@/lib/utils/file-utils';
import type { FeaturedSignal } from '@/types/features';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const symbolUpper = symbol.toUpperCase();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const historicalPath = buildHistoricalPath(process.cwd());

    if (!await fileExists(historicalPath)) {
      return NextResponse.json({
        success: false,
        error: 'No historical data available',
      }, { status: 404 });
    }

    const allRecords = await readJsonl<FeaturedSignal>(historicalPath);
    const symbolRecords = allRecords
      .filter(r => r.symbol === symbolUpper)
      .sort((a, b) => b.scrape_date.localeCompare(a.scrape_date));

    if (symbolRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No data found for symbol: ${symbolUpper}`,
      }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      data: {
        symbol: symbolUpper,
        latest,
        history: history.slice(0, days),
        priceHistory,
        momentumHistory,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
