import type { PipelineResult } from '@/types/index';
import { PipelineRunner } from './runner';
import { readJson, findFiles } from '@/lib/utils/file-utils';
import { join } from 'node:path';

export interface BackfillResult {
  startDate: string;
  endDate: string;
  daysProcessed: number;
  totalRecords: number;
  errors: Array<{ date: string; error: string }>;
}

export class BackfillRunner {
  private runner: PipelineRunner;
  
  constructor(basePath?: string) {
    this.runner = new PipelineRunner(basePath);
  }
  
  async run(startDate: string, endDate: string): Promise<BackfillResult> {
    const result: BackfillResult = {
      startDate,
      endDate,
      daysProcessed: 0,
      totalRecords: 0,
      errors: [],
    };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const current = new Date(start);
    
    while (current <= end) {
      const date = current.toISOString().slice(0, 10);
      
      try {
        const pipelineResult = await this.runner.run({ date, force: true });
        
        if (pipelineResult.status === 'success') {
          result.daysProcessed++;
          result.totalRecords += pipelineResult.records_processed || 0;
        } else if (pipelineResult.status === 'error') {
          result.errors.push({ date, error: pipelineResult.error || 'Unknown error' });
        }
      } catch (error) {
        result.errors.push({
          date,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return result;
  }
  
  async reprocessFeatures(): Promise<{ datesUpdated: number; errors: string[] }> {
    const basePath = join(process.cwd(), 'data');
    const rawDir = join(basePath, 'raw', 'nepse');
    
    const dates: string[] = [];
    const errors: string[] = [];
    
    try {
      const yearDirs = await findFiles(rawDir, /^\d{4}$/);
      
      for (const yearDir of yearDirs) {
        const monthDirs = await findFiles(yearDir, /^\d{2}$/);
        
        for (const monthDir of monthDirs) {
          const dayDirs = await findFiles(monthDir, /^\d{2}$/);
          
          for (const dayDir of dayDirs) {
            const parts = dayDir.split('/');
            const year = parts[parts.length - 3];
            const month = parts[parts.length - 2];
            const day = parts[parts.length - 1];
            dates.push(`${year}-${month}-${day}`);
          }
        }
      }
    } catch (error) {
      return { datesUpdated: 0, errors: ['Failed to find raw directories'] };
    }
    
    let datesUpdated = 0;
    
    for (const date of dates.sort()) {
      try {
        const result = await this.runner.run({ date, force: true });
        
        if (result.status === 'success') {
          datesUpdated++;
        }
      } catch (error) {
        errors.push(`${date}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return { datesUpdated, errors };
  }
}

export async function backfill(startDate: string, endDate: string): Promise<BackfillResult> {
  const runner = new BackfillRunner();
  return runner.run(startDate, endDate);
}