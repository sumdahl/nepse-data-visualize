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

import puppeteer from 'puppeteer';
import { config } from '../config/index.js';
import { transformRawData } from '../utils/transform.js';
import { TradingSignal } from '../types/index.js';
import { TradingSignalRepository } from '../db/repository.js';

class NepseScraper {
  private iTagTitleColumnIndices: number[] = [];
  private tdTitleColumnIndices: number[] = [];

  async scrape(): Promise<TradingSignal[]> {
    console.log('🚀 Starting NEPSE data scrape...');
    console.log(`📍 Target URL: ${config.scraper.url}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const allDataRows: string[][] = [];
    let headers: string[] = [];

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.setViewport({ width: 1366, height: 768 });

      console.log('📡 Navigating to target page...');
      await page.goto(config.scraper.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      console.log('⏳ Waiting for table to load...');
      await page.waitForSelector(config.scraper.tableSelector, { timeout: 90000 });
      await page.waitForSelector(config.scraper.paginationContainerSelector, { timeout: 30000 });
      await page.waitForSelector(config.scraper.firstDataCellSelector, { timeout: 30000 });

      console.log('✅ Table loaded. Scraping headers...');
      headers = await this.scrapeHeaders(page);

      if (headers.length > 0) {
        this.determineColumnIndices(headers);
      } else {
        throw new Error('Failed to scrape table headers');
      }

      let currentPage = 1;
      while (true) {
        console.log(`📄 Processing page ${currentPage}...`);

        const currentPageData = await this.scrapePageData(page);
        allDataRows.push(...currentPageData);
        console.log(`   ✓ Scraped ${currentPageData.length} rows (Total: ${allDataRows.length})`);

        const hasNextPage = await this.navigateToNextPage(page, currentPage);
        if (!hasNextPage) {
          console.log('📑 Reached last page');
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
      console.log('🔒 Browser closed');
    }
  }

  private async scrapeHeaders(page: puppeteer.Page): Promise<string[]> {
    try {
      let headers = await page.$$eval(
        `${config.scraper.tableSelector} thead th`,
        ths => ths.map(th => th.innerText.trim())
      );

      if (headers.length === 0) {
        headers = await page.$$eval(
          `${config.scraper.tableSelector} tr:first-child td`,
          tds => tds.map(td => td.innerText.trim())
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

  private async scrapePageData(page: puppeteer.Page): Promise<string[][]> {
    return await page.$$eval(
      `${config.scraper.tableSelector} tbody tr`,
      (rows, iTagIndices, tdIndices) => {
        const data: string[][] = [];
        for (const row of rows) {
          const rowData: string[] = [];
          row.querySelectorAll('td').forEach((cell, cellIndex) => {
            let cellValue = cell.innerText.trim();

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

  private async navigateToNextPage(page: puppeteer.Page, currentPage: number): Promise<boolean> {
    const nextButton = await page.$(config.scraper.nextButtonSelector);

    if (!nextButton) {
      return false;
    }

    let oldFirstCellText = '';
    try {
      await page.waitForSelector(config.scraper.firstDataCellSelector, { timeout: 5000 });
      oldFirstCellText = await page.$eval(
        config.scraper.firstDataCellSelector,
        el => el.innerText.trim()
      );
    } catch (e) {
      oldFirstCellText = "____NO_OLD_TEXT____";
    }

    await nextButton.click();

    try {
      await page.waitForFunction(
        (selector, oldText) => {
          const el = document.querySelector(selector);
          return el && el.innerText.trim() !== oldText;
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
    console.log('🌐 NEPSE Trading Signals Scraper');
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
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

    // Save to database
    console.log('\n💾 Saving to database...');
    await repository.upsertSignals(signals);
    console.log(`✅ Successfully saved ${signals.length} signals to database`);

    // Calculate statistics
    const sectors = new Set(signals.map(s => s.sector));
    const summaries = new Set(signals.map(s => s.technicalSummary));
    
    console.log('\n📊 Scrape Statistics:');
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

