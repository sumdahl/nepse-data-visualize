#!/usr/bin/env bun

/**
 * Daily NEPSE Trading Signals Scraper
 * 
 * This script:
 * 1. Scrapes trading signals from nepsealpha.com
 * 2. Transforms the data to our schema
 * 3. Stores it in Supabase database
 * 
 * Run manually: bun run src/scripts/scrape.ts
 * Or via GitHub Actions: scheduled daily at 5 PM Nepal Time
 */

import { connect } from 'puppeteer-real-browser';
import { Page, Browser } from 'puppeteer-core';
import { config } from '../config/index.js';
import { transformRawData } from '../utils/transform.js';
import { TradingSignal } from '../types/index.js';
import { TradingSignalRepository } from '../db/repository.js';
import { writeFile } from 'node:fs/promises';

class NepseScraper {
  private iTagTitleColumnIndices: number[] = [];
  private tdTitleColumnIndices: number[] = [];

  async scrape(): Promise<TradingSignal[]> {
    console.log('Starting NEPSE data scrape...');
    console.log(`Target URL: ${config.scraper.url}`);
    
    console.log('Launching real browser to bypass Cloudflare...');
    
    let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    
    if (!executablePath) {
      if (process.platform === 'darwin') {
        const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
        const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        
        if (await Bun.file(bravePath).exists()) {
          executablePath = bravePath;
        } else if (await Bun.file(chromePath).exists()) {
          executablePath = chromePath;
        }
      } else if (process.platform === 'linux') {
        executablePath = '/usr/bin/google-chrome'; // Default for GitHub Actions
      }
    }

    console.log(`Using browser at: ${executablePath || 'default system path'}`);

    const { browser, page } = await connect({
      headless: false, // Must be false to pass Turnstile? User suggested false or 'new'
      turnstile: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080'
      ],
      customConfig: executablePath ? {
        chromePath: executablePath
      } : {},
      connectOption: {
        defaultViewport: null
      }
    }) as any as { browser: Browser, page: Page };

    const allDataRows: string[][] = [];
    let headers: string[] = [];

    try {
      // Page is already created by connect()
      await page.setViewport({ width: 1366, height: 768 });

      console.log('Navigating to target page...');
      await page.goto(config.scraper.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      console.log('⏳ Waiting for table to load...');
      
      // Wait for the DataTables wrapper to appear first
      await page.waitForSelector('#funda-table_wrapper', { timeout: 30000 });
      console.log('   ✓ DataTables wrapper loaded');
      
      // Wait for the actual table with data
      await page.waitForSelector(config.scraper.tableSelector, { timeout: 60000 });
      console.log('   ✓ Table element loaded');
      
      // Wait for tbody with actual data rows (this ensures DataTables has initialized)
      await page.waitForSelector('#funda-table tbody tr', { timeout: 60000 });
      console.log('   ✓ Table data loaded');
      
      // Wait for pagination to ensure everything is ready
      await page.waitForSelector(config.scraper.paginationContainerSelector, { timeout: 30000 });
      console.log('   ✓ Pagination loaded');
      
      // Optimization: Change "Show entries" to 100 to reduce number of pages
      console.log('⚡ Optimizing: Setting table to show 100 entries per page...');
      await page.evaluate(() => {
        const select = document.querySelector('select[name$="_length"]') as HTMLSelectElement;
        if (select) {
          select.value = '100';
          select.dispatchEvent(new Event('change'));
        }
      });
      
      // Wait for the table to refresh (ensure at least 11 rows are present or a reliable indicator)
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('   ✓ Table updated to 100 entries');

      console.log('✅ Table loaded. Scraping headers...');
      headers = await this.scrapeHeaders(page);

      if (headers.length > 0) {
        this.determineColumnIndices(headers);
      } else {
        throw new Error('Failed to scrape table headers');
      }

      let currentPage = 1;
      while (true) {
        console.log(`Processing page ${currentPage}...`);

        const currentPageData = await this.scrapePageData(page);
        allDataRows.push(...currentPageData);
        console.log(`   ✓ Scraped ${currentPageData.length} rows (Total: ${allDataRows.length})`);

        const hasNextPage = await this.navigateToNextPage(page, currentPage);
        if (!hasNextPage) {
          console.log('Reached last page');
          break;
        }

        currentPage++;
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`\n✅ Scraping complete! Total rows: ${allDataRows.length}`);

      const signals = this.convertToSignals(headers, allDataRows);
      console.log(`✅ Converted to ${signals.length} trading signals`);

      return signals;

    } catch (error) {
      console.error('❌ Scraping error:', error);
      throw error;
    } finally {
      await browser.close();
      console.log('Browser closed');
    }
  }

  private async scrapeHeaders(page: Page): Promise<string[]> {
    try {
      let headers = await page.$$eval(
        `${config.scraper.tableSelector} thead th`,
        ths => ths.map(th => (th as any).innerText.trim())
      );

      if (headers.length === 0) {
        headers = await page.$$eval(
          `${config.scraper.tableSelector} tr:first-child td`,
          tds => tds.map(td => (td as any).innerText.trim())
        );
      }

      if (headers.length > 0) {
        console.log(`   ✓ Found ${headers.length} headers`);
      }

      return headers;
    } catch (error) {
      console.warn(`⚠️  Error scraping headers: ${error}`);
      return [];
    }
  }

  private determineColumnIndices(headers: string[]): void {
    this.iTagTitleColumnIndices = config.scraper.headersWithITagTitle
      .map(header => headers.indexOf(header))
      .filter(index => index !== -1);

    this.tdTitleColumnIndices = config.scraper.headersWithTDTitle
      .map(header => headers.indexOf(header))
      .filter(index => index !== -1);

    console.log(`   ✓ Determined special column indices (iTag: ${this.iTagTitleColumnIndices.length}, td: ${this.tdTitleColumnIndices.length})`);
  }

  private async scrapePageData(page: Page): Promise<string[][]> {
    return await page.$$eval(
      `${config.scraper.tableSelector} tbody tr`,
      (rows, iTagIndices, tdIndices) => {
        const data: string[][] = [];
        for (const row of rows) {
          const rowData: string[] = [];
          row.querySelectorAll('td').forEach((cell, cellIndex) => {
            let cellValue = (cell as any).innerText.trim();

            if (iTagIndices.includes(cellIndex)) {
              const iTag = cell.querySelector('i');
              if (iTag && iTag.title) {
                cellValue = iTag.title.trim();
              }
            } else if (tdIndices.includes(cellIndex)) {
              if (cell.title) {
                cellValue = cell.title.trim();
              }
            }

            rowData.push(cellValue);
          });

          if (rowData.length > 0) {
            data.push(rowData);
          }
        }
        return data;
      },
      this.iTagTitleColumnIndices,
      this.tdTitleColumnIndices
    );
  }

  private async navigateToNextPage(page: Page, currentPage: number): Promise<boolean> {
    const nextButton = await page.$(config.scraper.nextButtonSelector);

    if (!nextButton) {
      return false;
    }

    let oldFirstCellText = '';
    try {
      await page.waitForSelector(config.scraper.firstDataCellSelector, { timeout: 5000 });
      oldFirstCellText = await page.$eval(
        config.scraper.firstDataCellSelector,
        el => (el as any).innerText.trim()
      );
    } catch (e) {
      oldFirstCellText = "____NO_OLD_TEXT____";
    }

    await nextButton.click();

    try {
      await page.waitForFunction(
        (selector, oldText) => {
          const el = document.querySelector(selector);
          return el && (el as any).innerText.trim() !== oldText;
        },
        { timeout: 45000 },
        config.scraper.firstDataCellSelector,
        oldFirstCellText
      );
      return true;
    } catch (waitError) {
      console.warn(`⚠️  Error waiting for page update: ${waitError}`);
      return false;
    }
  }

  private convertToSignals(headers: string[], dataRows: string[][]): TradingSignal[] {
    if (headers.length === 0 || dataRows.length === 0) {
      return [];
    }

    const signals: TradingSignal[] = [];

    for (const row of dataRows) {
      const rowObject: Record<string, string> = {};
      headers.forEach((key, index) => {
        rowObject[key] = row[index] !== undefined ? row[index] : '';
      });

      try {
        const signal = transformRawData(rowObject);
        signals.push(signal);
      } catch (error) {
        console.warn(`⚠️  Error transforming row: ${error}`);
      }
    }

    return signals;
  }
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  try {
    console.log('='.repeat(60));
    console.log('NEPSE Trading Signals Scraper');
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    console.log('');

    // Check for database URL
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Initialize scraper and repository
    const scraper = new NepseScraper();
    const repository = new TradingSignalRepository();

    // Scrape data
    const signals = await scraper.scrape();

    if (signals.length === 0) {
      throw new Error('No signals were scraped');
    }

    // Debug: persist scraped data locally
    await writeFile('scraped_data.json', JSON.stringify(signals, null, 2), 'utf8');
    console.log('Wrote scraped data to scraped_data.json');

    const scrapedAtValues = signals
      .map(s => s.scrapedAt)
      .filter((d): d is Date => d instanceof Date);
    if (scrapedAtValues.length > 0) {
      const minScrapedAt = new Date(Math.min(...scrapedAtValues.map(d => d.getTime())));
      const maxScrapedAt = new Date(Math.max(...scrapedAtValues.map(d => d.getTime())));
      console.log(`   • scrapedAt range: ${minScrapedAt.toISOString()} -> ${maxScrapedAt.toISOString()}`);
    } else {
      console.log('   • scrapedAt range: unavailable (no valid Date values)');
    }

    // Save to database
    console.log('\nSaving to database...');
    const runScrapedAt = signals[0]?.scrapedAt || new Date();
    const runDate = runScrapedAt.toISOString().slice(0, 10);
    const alreadyUpdatedToday = await repository.hasSuccessfulRunForDate(runDate);
    if (alreadyUpdatedToday) {
      console.log(`Skipping DB update: already updated on ${runDate}`);
      return;
    }

    const scrapeRunId = await repository.createScrapeRun({
      scrapedAt: runScrapedAt,
      sourceUrl: config.scraper.url,
      status: "started",
    });

    const runDurationMs = Date.now() - startTime;
    try {
      await repository.upsertSignals(signals, scrapeRunId);
      await repository.finishScrapeRun({
        id: scrapeRunId,
        status: "success",
        rowCount: signals.length,
        durationMs: runDurationMs,
      });
    } catch (e) {
      await repository.finishScrapeRun({
        id: scrapeRunId,
        status: "failed",
        rowCount: 0,
        durationMs: runDurationMs,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
    console.log(`✅ Successfully saved ${signals.length} signals to database`);

    // Calculate statistics
    const sectors = new Set(signals.map(s => s.sector));
    const summaries = new Set(signals.map(s => s.technicalSummary));
    
    console.log('\nScrape Statistics:');
    console.log(`   • Total Signals: ${signals.length}`);
    console.log(`   • Unique Sectors: ${sectors.size}`);
    console.log(`   • Technical Summaries: ${summaries.size}`);
    console.log(`   • Sectors: ${Array.from(sectors).join(', ')}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️  Total time: ${duration}s`);
    console.log('='.repeat(60));
    console.log('✅ Scraping completed successfully!');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ SCRAPING FAILED');
    console.error('='.repeat(60));
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    console.error('='.repeat(60));
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
