import type { PipelineResult, PipelineOptions, RawSignal } from '@/types/index';
import { writeRaw, createRawSignal } from './raw-writer';
import { validateRawSignals, validateOrThrow } from './validator';
import { normalizeSignal, normalizeSignals } from './normalizer';
import { encodeSignals, buildRawDataMap } from './encoder';
import { engineerFeaturesBatch } from './feature-engineering';
import { aggregateCleaned, aggregateFeatures, isAlreadyProcessed, getCleanedRecords } from './aggregator';
import { appendToHistorical, getHistoricalStats } from './historical';
import { readJson, findFilesByDate, buildCleanedPath, fileExists, findFiles } from '@/lib/utils/file-utils';
import { today } from '@/lib/utils/parsers';
import { join } from 'node:path';

const DATA_BASE_PATH = join(process.cwd(), 'data');

export class PipelineRunner {
  private basePath: string;
  
  constructor(basePath?: string) {
    this.basePath = basePath || DATA_BASE_PATH;
  }
  
  async run(options: PipelineOptions = {}): Promise<PipelineResult> {
    const startTime = Date.now();
    const date = options.date || today();
    
    try {
      if (!options.force && await isAlreadyProcessed(this.basePath, date)) {
        return {
          status: 'no_new_data',
          date,
          records_processed: 0,
        };
      }
      
      const rawFiles = await findFilesByDate(this.basePath, date);
      
      if (rawFiles.length === 0) {
        return {
          status: 'no_new_data',
          date,
          records_processed: 0,
        };
      }
      
      const allRawSignals: RawSignal[] = [];
      const rawDataMap = new Map<string, Record<string, any>>();
      
      for (const file of rawFiles) {
        const content = await readJson<{ metadata: { scrapeDate: string }; records: RawSignal[] }>(file);
        const fileDate = content.metadata?.scrapeDate || date;
        
        for (const signal of content.records) {
          const enrichedSignal = {
            ...signal,
            scrapeDate: signal.scrapeDate || fileDate,
          };
          allRawSignals.push(enrichedSignal);
          rawDataMap.set(signal.symbol, signal);
        }
      }
      
      const validation = validateRawSignals(allRawSignals);
      
      if (validation.valid.length === 0) {
        return {
          status: 'error',
          error: 'No valid records found',
          date,
        };
      }
      
      const normalized = normalizeSignals(validation.valid);
      const encoded = encodeSignals(normalized, rawDataMap);
      
      const aggResult = await aggregateCleaned(this.basePath, encoded, date);
      
      let featuredRecords = 0;
      
      if (!options.skipFeatures) {
        const featured = engineerFeaturesBatch(encoded);
        await aggregateFeatures(this.basePath, featured, date);
        await appendToHistorical(this.basePath, featured);
        featuredRecords = featured.length;
      }
      
      return {
        status: 'success',
        date,
        records_processed: allRawSignals.length,
        records_cleaned: aggResult.totalRecords,
        records_featured: featuredRecords,
        duration_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        date,
        duration_ms: Date.now() - startTime,
      };
    }
  }
  
  async runFromRawRecords(
    records: RawSignal[],
    options: PipelineOptions = {}
  ): Promise<PipelineResult> {
    const startTime = Date.now();
    const date = options.date || today();
    
    try {
      const rawDataMap = buildRawDataMap(records);
      
      const validation = validateRawSignals(records);
      
      if (validation.valid.length === 0) {
        return {
          status: 'error',
          error: 'No valid records found',
          date,
        };
      }
      
      const normalized = normalizeSignals(validation.valid);
      const encoded = encodeSignals(normalized, rawDataMap);
      
      const aggResult = await aggregateCleaned(this.basePath, encoded, date);
      
      let featuredRecords = 0;
      
      if (!options.skipFeatures) {
        const featured = engineerFeaturesBatch(encoded);
        await aggregateFeatures(this.basePath, featured, date);
        await appendToHistorical(this.basePath, featured);
        featuredRecords = featured.length;
      }
      
      return {
        status: 'success',
        date,
        records_processed: records.length,
        records_cleaned: aggResult.totalRecords,
        records_featured: featuredRecords,
        duration_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        date,
        duration_ms: Date.now() - startTime,
      };
    }
  }
  
  async getStatus(): Promise<{
    historical: Awaited<ReturnType<typeof getHistoricalStats>>;
    lastProcessed: string | null;
  }> {
    const stats = await getHistoricalStats(this.basePath);
    
    const allDates: string[] = [];
    const rawDir = join(this.basePath, 'data', 'raw', 'nepse');
    
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
            allDates.push(`${year}-${month}-${day}`);
          }
        }
      }
    } catch {}
    
    const lastProcessed = allDates.sort().reverse()[0] || null;
    
    return {
      historical: stats,
      lastProcessed,
    };
  }
}

export async function runPipeline(options?: PipelineOptions): Promise<PipelineResult> {
  const runner = new PipelineRunner();
  return runner.run(options);
}