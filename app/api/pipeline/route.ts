import { NextResponse } from 'next/server';
import { PipelineRunner, BackfillRunner } from '@/pipeline/index';
import { getHistoricalStats, queryHistorical } from '@/pipeline/historical';
import { join } from 'path';

const DATA_BASE_PATH = join(process.cwd(), 'data');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';
  const runner = new PipelineRunner(DATA_BASE_PATH);
  
  try {
    switch (action) {
      case 'status': {
        const status = await runner.getStatus();
        return NextResponse.json(status);
      }
      
      case 'historical': {
        const symbol = searchParams.get('symbol') || undefined;
        const sector = searchParams.get('sector') || undefined;
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        
        const records = await queryHistorical(DATA_BASE_PATH, {
          symbol,
          sector,
          startDate,
          endDate,
          limit,
        });
        
        return NextResponse.json({ count: records.length, records });
      }
      
      case 'stats': {
        const stats = await getHistoricalStats(DATA_BASE_PATH);
        return NextResponse.json(stats);
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { action, date, startDate, endDate, force, skipFeatures } = body;
  const runner = new PipelineRunner(DATA_BASE_PATH);
  
  try {
    switch (action) {
      case 'run': {
        const result = await runner.run({ date, force, skipFeatures });
        return NextResponse.json(result);
      }
      
      case 'backfill': {
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate required for backfill' },
            { status: 400 }
          );
        }
        
        const backfillRunner = new BackfillRunner(DATA_BASE_PATH);
        const result = await backfillRunner.run(startDate, endDate);
        return NextResponse.json(result);
      }
      
      case 'reprocess-features': {
        const backfillRunner = new BackfillRunner(DATA_BASE_PATH);
        const result = await backfillRunner.reprocessFeatures();
        return NextResponse.json(result);
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}