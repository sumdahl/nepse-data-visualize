#!/usr/bin/env bun

import { readJson, writeJsonAtomic, buildRawPath, ensureDir } from '../lib/utils/file-utils.js';
import { join } from 'node:path';
import { readdir } from 'node:fs/promises';

const DATA_DIR = join(process.cwd(), 'data');
const RAW_VERSION = '1.0.0';
const SOURCE = 'nepsealpha.com';

interface ExistingSignal {
  symbol: string;
  technicalSummary: string;
  technicalEntryRisk: string;
  sector: string;
  dailyGain: string;
  ltp: number;
  dailyVolatility: string;
  priceRelative: string;
  trend3M: string;
  rsi14: number;
  macdVsSignalLine: string;
  percentB: string;
  mfi14: number;
  sto14: number;
  cci14: number;
  stochRSI: number;
  sma10: string;
  priceAbove20SMA: string;
  priceAbove50SMA: string;
  priceAbove200SMA: string;
  sma5Above20SMA: string;
  sma50_200: string;
  volumeTrend: string;
  beta3Month: number;
  scrapedAt: string;
  scrapeDate: string;
}

async function migrateFile(filename: string): Promise<{ date: string; count: number }> {
  const filePath = join(DATA_DIR, filename);
  const signals = await readJson<ExistingSignal[]>(filePath);
  
  if (!Array.isArray(signals) || signals.length === 0) {
    throw new Error(`Invalid or empty file: ${filename}`);
  }
  
  const firstSignal = signals[0];
  const scrapeDate = firstSignal.scrapeDate || filename.replace('.json', '');
  const scrapedAt = firstSignal.scrapedAt || new Date().toISOString();
  
  const time = scrapedAt.slice(11, 19).replace(/:/g, '') || '000000';
  
  const metadata = {
    totalRecords: signals.length,
    scrapedAt,
    scrapeDate,
    source: SOURCE,
    version: RAW_VERSION,
  };
  
  const rawFile = { metadata, records: signals };
  const rawPath = buildRawPath(DATA_DIR, scrapeDate, time);
  
  await writeJsonAtomic(rawPath, rawFile);
  
  return { date: scrapeDate, count: signals.length };
}

async function main() {
  console.log('Migrating existing JSON files to raw layer...\n');
  
  const files = await readdir(DATA_DIR);
  const jsonFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
  
  if (jsonFiles.length === 0) {
    console.log('No JSON files found to migrate.');
    return;
  }
  
  console.log(`Found ${jsonFiles.length} files to migrate:\n`);
  
  const results: Array<{ file: string; date: string; count: number }> = [];
  
  for (const file of jsonFiles) {
    try {
      const result = await migrateFile(file);
      results.push({ file, ...result });
      console.log(`  ✓ ${file} → ${result.date} (${result.count} records)`);
    } catch (error) {
      console.error(`  ✗ ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log('Migration Summary:');
  console.log(`  Files migrated: ${results.length}/${jsonFiles.length}`);
  console.log(`  Total records: ${results.reduce((sum, r) => sum + r.count, 0)}`);
  console.log(`  Raw location: data/raw/nepse/{YYYY}/{MM}/{DD}/`);
  
  console.log('\nOriginal files preserved in data/ directory.');
  console.log('You may delete them after verifying the migration.');
}

main().catch(console.error);