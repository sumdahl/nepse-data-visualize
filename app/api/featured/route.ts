import { NextResponse } from 'next/server';
import { readJsonl, fileExists, buildFeaturesPath } from '@/lib/utils/file-utils';
import type { FeaturedSignal } from '@/types/features';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

export const dynamic = 'force-dynamic';

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
          if (match) {
            return match[1];
          }
        }
      }
    }
  } catch {}
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get('date');
    const sector = searchParams.get('sector') || undefined;
    const symbol = searchParams.get('symbol') || undefined;
    const minMomentum = searchParams.get('minMomentum') ? parseFloat(searchParams.get('minMomentum')!) : undefined;
    const maxMomentum = searchParams.get('maxMomentum') ? parseFloat(searchParams.get('maxMomentum')!) : undefined;
    const rsiZone = searchParams.get('rsiZone') as 'overbought' | 'oversold' | 'neutral' | undefined;
    const limit = parseInt(searchParams.get('limit') || '500');

    const today = new Date().toISOString().slice(0, 10);
    let targetDate = requestedDate || today;
    
    let featuresPath = buildFeaturesPath(process.cwd(), targetDate);
    
    if (!await fileExists(featuresPath)) {
      const latestDate = await getLatestFeaturesDate();
      if (latestDate) {
        targetDate = latestDate;
        featuresPath = buildFeaturesPath(process.cwd(), targetDate);
      }
    }
    
    if (!await fileExists(featuresPath)) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        date: targetDate,
        message: 'No data available',
      });
    }

    let signals = await readJsonl<FeaturedSignal>(featuresPath);

    if (sector) {
      signals = signals.filter(s => s.sector.toLowerCase().includes(sector.toLowerCase()));
    }

    if (symbol) {
      signals = signals.filter(s => s.symbol.toLowerCase().includes(symbol.toLowerCase()));
    }

    if (minMomentum !== undefined) {
      signals = signals.filter(s => s.momentum_score >= minMomentum);
    }

    if (maxMomentum !== undefined) {
      signals = signals.filter(s => s.momentum_score <= maxMomentum);
    }

    if (rsiZone) {
      signals = signals.filter(s => s.rsi_zone === rsiZone);
    }

    const sortedSignals = signals
      .sort((a, b) => b.signal_composite - a.signal_composite)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: sortedSignals,
      count: sortedSignals.length,
      date: targetDate,
    });
  } catch (error) {
    console.error('Error fetching featured signals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured signals' },
      { status: 500 }
    );
  }
}
