import { NextResponse } from 'next/server';
import { readJsonl, fileExists, buildHistoricalPath } from '@/lib/utils/file-utils';
import type { FeaturedSignal } from '@/types/features';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const sector = searchParams.get('sector');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '1000');

    const historicalPath = buildHistoricalPath(process.cwd());

    if (!await fileExists(historicalPath)) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No historical data available',
      });
    }

    let records = await readJsonl<FeaturedSignal>(historicalPath);

    if (symbol) {
      records = records.filter(r => r.symbol.toLowerCase() === symbol.toLowerCase());
    }

    if (sector) {
      records = records.filter(r => r.sector.toLowerCase().includes(sector.toLowerCase()));
    }

    if (startDate) {
      records = records.filter(r => r.scrape_date >= startDate);
    }

    if (endDate) {
      records = records.filter(r => r.scrape_date <= endDate);
    }

    records = records
      .sort((a, b) => a.scrape_date.localeCompare(b.scrape_date))
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
