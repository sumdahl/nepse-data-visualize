# ✅ Daily Scraping Setup Complete!

Your daily scraping at **5 PM Nepal Time** is now configured! Here's what was set up:

## 📁 Files Created

1. **`.github/workflows/daily-scrape.yml`**
   - GitHub Actions workflow
   - Runs daily at 5 PM Nepal Time (11:15 AM UTC)
   - Handles Puppeteer dependencies
   - Includes error handling

2. **`src/scripts/scrape.ts`**
   - Main scraper script
   - TypeScript with proper error handling
   - Saves data to Supabase
   - Provides detailed logging

3. **Supporting Files:**
   - `src/config/index.ts` - Configuration
   - `src/types/index.ts` - TypeScript types
   - `src/utils/transform.ts` - Data transformation
   - `src/db/repository.ts` - Database operations

## 🚀 Next Steps

### 1. Install Dependencies
```bash
bun install
```

### 2. Set Up Database Schema
You'll need to create the `trading_signals` table in Supabase. The schema will be created when we set up Drizzle ORM in Phase 1.

For now, you can create it manually in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS trading_signals (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  technical_summary VARCHAR(50),
  technical_entry_risk VARCHAR(50),
  sector VARCHAR(100),
  daily_gain VARCHAR(20),
  ltp DECIMAL(10, 2),
  daily_volatility VARCHAR(20),
  price_relative VARCHAR(20),
  trend_3m VARCHAR(50),
  rsi_14 DECIMAL(10, 2),
  macd_vs_signal_line VARCHAR(50),
  percent_b VARCHAR(20),
  mfi_14 DECIMAL(10, 2),
  sto_14 DECIMAL(10, 2),
  cci_14 DECIMAL(10, 2),
  stoch_rsi INTEGER,
  sma_10 VARCHAR(100),
  price_above_20_sma VARCHAR(100),
  price_above_50_sma VARCHAR(100),
  price_above_200_sma VARCHAR(100),
  sma_5_above_20_sma VARCHAR(50),
  sma_50_200 VARCHAR(50),
  volume_trend VARCHAR(50),
  beta_3_month DECIMAL(10, 2),
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, scraped_at)
);

CREATE INDEX IF NOT EXISTS idx_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_scraped_at ON trading_signals(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_sector ON trading_signals(sector);
```

### 3. Set Up GitHub Secret
1. Go to your GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Add secret: `DATABASE_URL` with your Supabase connection string

### 4. Test the Scraper Locally
```bash
# Set environment variable
export DATABASE_URL="your-supabase-connection-string"

# Run scraper
bun run scrape
```

### 5. Test GitHub Actions
1. Go to **Actions** tab in GitHub
2. Click **Daily NEPSE Data Scrape**
3. Click **Run workflow**
4. Watch it execute!

## ⏰ Schedule

- **Time:** 5:00 PM Nepal Time (NPT)
- **UTC:** 11:15 AM UTC
- **Cron:** `15 11 * * *`
- **Frequency:** Daily

## 📊 What Happens

When the workflow runs:
1. ✅ Launches Puppeteer browser
2. ✅ Navigates to nepsealpha.com
3. ✅ Scrapes all pages of trading signals
4. ✅ Transforms data to structured format
5. ✅ Saves to Supabase database
6. ✅ Shows statistics and completion status

## 🔧 Customization

To change the time, edit `.github/workflows/daily-scrape.yml`:

```yaml
schedule:
  # Current: 5 PM NPT (11:15 AM UTC)
  - cron: '15 11 * * *'
  
  # Example: 6 PM NPT (12:15 PM UTC)
  - cron: '15 12 * * *'
```

## 📝 Notes

- The scraper handles pagination automatically
- Data is upserted (updates if exists, inserts if new)
- Errors are logged and workflow continues
- Free tier GitHub Actions: 2,000 min/month (private) or unlimited (public)

---

**Ready to go!** Once you set up the database schema and GitHub secret, the scraper will run automatically every day at 5 PM Nepal Time! 🎉

