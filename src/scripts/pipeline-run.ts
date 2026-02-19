#!/usr/bin/env bun

import { PipelineRunner, BackfillRunner } from '../pipeline/index.js';
import { getHistoricalStats } from '../pipeline/historical.js';
import { join } from 'node:path';

const DATA_BASE_PATH = process.cwd();

function printUsage() {
  console.log(`
NEPSE Data Pipeline CLI

Usage:
  bun run src/scripts/pipeline-run.ts [command] [options]

Commands:
  run [date]           Run pipeline for a specific date (default: today)
  backfill <start> <end>   Backfill data between dates
  status               Show pipeline status
  reprocess-features   Re-run feature engineering on all historical data

Options:
  --force              Force reprocessing even if already processed
  --skip-features      Skip feature engineering step

Examples:
  bun run src/scripts/pipeline-run.ts run
  bun run src/scripts/pipeline-run.ts run 2026-02-15
  bun run src/scripts/pipeline-run.ts run --force
  bun run src/scripts/pipeline-run.ts backfill 2026-02-01 2026-02-15
  bun run src/scripts/pipeline-run.ts status
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }
  
  const command = args[0];
  const runner = new PipelineRunner(DATA_BASE_PATH);
  
  try {
    switch (command) {
      case 'run': {
        const force = args.includes('--force');
        const skipFeatures = args.includes('--skip-features');
        const date = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
        
        console.log(`Running pipeline for ${date || 'today'}...`);
        const result = await runner.run({ date, force, skipFeatures });
        
        console.log('\nResult:');
        console.log(JSON.stringify(result, null, 2));
        
        process.exit(result.status === 'success' ? 0 : 1);
      }
      
      case 'backfill': {
        const startDate = args[1];
        const endDate = args[2];
        
        if (!startDate || !endDate) {
          console.error('Error: backfill requires start and end dates');
          console.log('Usage: bun run src/scripts/pipeline-run.ts backfill 2026-02-01 2026-02-15');
          process.exit(1);
        }
        
        console.log(`Backfilling from ${startDate} to ${endDate}...`);
        const backfillRunner = new BackfillRunner(DATA_BASE_PATH);
        const result = await backfillRunner.run(startDate, endDate);
        
        console.log('\nBackfill Result:');
        console.log(`  Days processed: ${result.daysProcessed}`);
        console.log(`  Total records: ${result.totalRecords}`);
        
        if (result.errors.length > 0) {
          console.log(`  Errors: ${result.errors.length}`);
          result.errors.forEach(e => console.log(`    - ${e.date}: ${e.error}`));
        }
        
        process.exit(0);
      }
      
      case 'status': {
        const status = await runner.getStatus();
        const stats = status.historical;
        
        console.log('\nPipeline Status:');
        console.log('─'.repeat(40));
        console.log(`Historical Records: ${stats.totalRecords}`);
        console.log(`Unique Symbols: ${stats.uniqueSymbols}`);
        console.log(`Date Range: ${stats.dateRange.start || 'N/A'} to ${stats.dateRange.end || 'N/A'}`);
        console.log(`Sectors: ${stats.sectors.length}`);
        console.log(`Last Processed: ${status.lastProcessed || 'N/A'}`);
        
        process.exit(0);
      }
      
      case 'reprocess-features': {
        console.log('Reprocessing features on all historical data...');
        const backfillRunner = new BackfillRunner(DATA_BASE_PATH);
        const result = await backfillRunner.reprocessFeatures();
        
        console.log(`\nDates updated: ${result.datesUpdated}`);
        
        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach(e => console.log(`  - ${e}`));
        }
        
        process.exit(0);
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('\nPipeline Error:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}