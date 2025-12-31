# 🚀 Quick Start Guide

Get your NEPSE Trading Signals Dashboard up and running in minutes!

## Step 1: Install Dependencies

```bash
bun install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy your connection string (looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

## Step 3: Create Environment File

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres
```

Replace with your actual Supabase connection string.

## Step 4: Set Up Database Schema

### Option A: Using Drizzle (Recommended)

```bash
# Generate migration
bun run db:generate

# Apply migration
bun run db:migrate
```

### Option B: Manual SQL (If Drizzle doesn't work)

Go to Supabase SQL Editor and run:

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
  stoch_rsi DECIMAL(10, 2),
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

## Step 5: Run Scraper (Optional - to get initial data)

```bash
bun run scrape
```

This will scrape data and save it to your database.

## Step 6: Start Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 7: Set Up GitHub Actions (For Daily Scraping)

1. Push your code to GitHub
2. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
3. Add a new secret:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string (same as `.env.local`)
4. The workflow will automatically run daily at 5 PM Nepal Time

## 🎉 You're Done!

Your dashboard should now be running! 

### What You Have:

- ✅ Next.js dashboard at `http://localhost:3000`
- ✅ Signals page at `http://localhost:3000/signals`
- ✅ Analysis page at `http://localhost:3000/analysis`
- ✅ API endpoints for data fetching
- ✅ Automated daily scraping (via GitHub Actions)

### Next Steps:

1. **Add More Visualizations**: Add charts using Recharts
2. **Build Analysis Features**: Implement the analysis algorithms from PROJECT_PLAN.md
3. **Deploy to Vercel**: Push to GitHub and deploy for free!

## 🆘 Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` exists and has the correct connection string
- Restart the dev server after creating `.env.local`

### "Table doesn't exist"
- Run the database migration: `bun run db:migrate`
- Or create the table manually in Supabase SQL Editor

### "Module not found"
- Run `bun install` again
- Make sure you're using Bun, not npm/yarn

### Scraper fails
- Check your `DATABASE_URL` is correct
- Verify the table exists in Supabase
- Check Supabase project is active

---

**Need more help?** Check the full documentation:
- `README.md` - Main documentation
- `PROJECT_PLAN.md` - Full project plan
- `FREE_SETUP_GUIDE.md` - Detailed free setup guide

