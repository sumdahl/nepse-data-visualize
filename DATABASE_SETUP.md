# 🗄️ Database Setup Guide

The database table needs to be created. You have two options:

## Option 1: Using Drizzle (Recommended)

### Step 1: Set Up Environment Variable

Create `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
```

Get your connection string from:
- Supabase Dashboard → Settings → Database → Connection string

### Step 2: Run Migration

```bash
bun run db:migrate
```

This will automatically create the table in your database.

---

## Option 2: Manual SQL (Quick Setup)

If you prefer to set up manually, go to **Supabase SQL Editor** and run this SQL:

```sql
CREATE TABLE IF NOT EXISTS "trading_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"technical_summary" varchar(50),
	"technical_entry_risk" varchar(50),
	"sector" varchar(100),
	"daily_gain" varchar(20),
	"ltp" numeric(10, 2),
	"daily_volatility" varchar(20),
	"price_relative" varchar(20),
	"trend_3m" varchar(50),
	"rsi_14" numeric(10, 2),
	"macd_vs_signal_line" varchar(50),
	"percent_b" varchar(20),
	"mfi_14" numeric(10, 2),
	"sto_14" numeric(10, 2),
	"cci_14" numeric(10, 2),
	"stoch_rsi" numeric(10, 2),
	"sma_10" varchar(100),
	"price_above_20_sma" varchar(100),
	"price_above_50_sma" varchar(100),
	"price_above_200_sma" varchar(100),
	"sma_5_above_20_sma" varchar(50),
	"sma_50_200" varchar(50),
	"volume_trend" varchar(50),
	"beta_3_month" numeric(10, 2),
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_symbol_scraped_at" UNIQUE("symbol","scraped_at")
);

CREATE INDEX IF NOT EXISTS "idx_symbol" ON "trading_signals" ("symbol");
CREATE INDEX IF NOT EXISTS "idx_scraped_at" ON "trading_signals" ("scraped_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_sector" ON "trading_signals" ("sector");
```

### Steps:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the SQL above
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. ✅ Table created!

---

## ✅ Verify Setup

After creating the table, verify it exists:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. You should see `trading_signals` table

---

## 🚀 Next Steps

Once the table is created:

1. **Run the scraper** to populate data:
   ```bash
   bun run scrape
   ```

2. **Start the dev server**:
   ```bash
   bun run dev
   ```

3. **View your dashboard** at `http://localhost:3000`

---

## 🔧 Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` exists in project root
- Check the connection string format
- Restart the dev server after creating `.env.local`

### "Table already exists"
- That's fine! The table is already set up
- You can skip the migration

### "Connection refused"
- Check your Supabase project is active
- Verify the connection string is correct
- Check if your IP is allowed (Supabase free tier allows all IPs)

---

**Need help?** Check `QUICK_START.md` for more details!

