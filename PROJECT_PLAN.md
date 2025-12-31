# NEPSE Trading Signals - Full Stack Project Plan

## 📊 Data Analysis & Insights Opportunities

### Current Data Structure
The scraped data contains **~3,400+ trading signals** with the following rich fields:

**Core Identifiers:**
- Symbol (Stock ticker)
- Sector (Commercial Banks, Microfinance, Hydro Power, etc.)

**Price & Performance:**
- LTP (Last Traded Price)
- Daily Gain (%)
- Daily Volatility (%)
- PRICE RELATIVE (%)
- 3 Month Beta

**Technical Indicators:**
- RSI 14 (Relative Strength Index)
- MACD VS Signal Line (Momentum)
- %B (Bollinger Bands)
- MFI 14 (Money Flow Index)
- Sto.14 (Stochastic Oscillator)
- 14-day CCI (Commodity Channel Index)
- StochRSI (Stochastic RSI)

**Moving Averages:**
- 10SMA, 20SMA, 50SMA, 200SMA relationships
- 5SMA > 20SMA
- SMA 50,200 crossover

**Trends & Risk:**
- Technical Summary (Strong Bullish, Weak Bullish, Bearish, etc.)
- Technical Entry Risk (High/Medium/Low)
- 3M TREND (TRENDING, MEAN REVERTING)
- Volume Trend (Trending Up/Down)

### 🎯 Unique Insights We Can Derive

1. **Sector Performance Analysis**
   - Best/worst performing sectors by technical indicators
   - Sector correlation analysis
   - Sector rotation patterns

2. **Risk-Reward Scoring**
   - Custom scoring algorithm combining RSI, MACD, Volume, and Risk
   - Identify high-probability setups
   - Risk-adjusted opportunity ranking

3. **Technical Pattern Recognition**
   - Golden Cross / Death Cross detection (50/200 SMA)
   - Oversold/Overbought clusters
   - Divergence detection (price vs indicators)

4. **Momentum Analysis**
   - Multi-indicator momentum scoring
   - Momentum persistence tracking
   - Momentum breakdown alerts

5. **Volatility Clustering**
   - High volatility opportunities
   - Low volatility stability plays
   - Volatility vs Return correlation

6. **Time-Series Analysis** (with historical data)
   - Indicator effectiveness over time
   - Best entry/exit timing patterns
   - Seasonal patterns by sector

7. **Portfolio Optimization**
   - Diversification recommendations
   - Sector allocation suggestions
   - Risk parity analysis

8. **Alert System**
   - Custom watchlists
   - Threshold-based alerts
   - Pattern completion notifications

---

## 🏗️ Architecture Plan

### Tech Stack (100% FREE - No Credit Card Required)
- **Runtime:** Bun (free, open-source)
- **Framework:** Next.js 14+ (App Router, free)
- **Database:** Supabase (PostgreSQL, free tier: 500MB, no credit card needed)
  - Alternative: NeonDB free tier (verify if credit card needed)
- **ORM:** Drizzle ORM (free, open-source)
- **Hosting:** Vercel (free hobby plan, no credit card needed)
- **Frontend:** 
  - shadcn/ui components (free, open-source)
  - Tailwind CSS (free)
  - Recharts (free, open-source) for visualizations
- **Scraping:** 
  - Puppeteer (free)
  - GitHub Actions (free) for scheduled scraping
  - Manual trigger via API for on-demand scraping
- **API:** Next.js API Routes (Server Actions, free)
- **Storage:** LocalStorage/IndexedDB for watchlists (client-side, free)

### Project Structure
```
nepse-scrape/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── page.tsx        # Main dashboard
│   │   │   ├── signals/        # Signals listing
│   │   │   ├── analysis/       # Analysis pages
│   │   │   └── portfolio/      # Portfolio tools
│   │   ├── api/                # API routes
│   │   │   ├── signals/        # Signal endpoints
│   │   │   ├── analysis/       # Analysis endpoints
│   │   │   └── scrape/         # Scrape trigger
│   │   └── layout.tsx
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn components
│   │   ├── charts/             # Chart components
│   │   ├── tables/             # Data tables
│   │   └── filters/            # Filter components
│   ├── lib/                    # Shared utilities
│   │   ├── db/                 # Drizzle setup
│   │   ├── scraper/            # Scraper logic
│   │   ├── analysis/           # Analysis algorithms
│   │   └── utils/              # Helpers
│   ├── types/                  # TypeScript types
│   └── hooks/                  # React hooks
├── drizzle/                    # Drizzle migrations
├── public/                     # Static assets
└── scripts/                    # Utility scripts
```

---

## 📋 Implementation Phases

### Phase 1: Foundation Setup (Week 1)
**Goal:** Set up the project structure and core infrastructure

1. ✅ Initialize Next.js with Bun
2. ✅ Set up Supabase free account (no credit card)
3. ✅ Set up Drizzle ORM with Supabase
4. ✅ Create database schema
5. ✅ Convert scraper to TypeScript
6. ✅ Set up shadcn/ui
7. ✅ Configure Tailwind CSS
8. ✅ Set up Vercel account (free, no credit card)

**Deliverables:**
- Working Next.js app
- Free Supabase database connection
- Basic scraper integration
- UI component library ready
- Ready for free deployment

### Phase 2: Data Pipeline (Week 1-2)
**Goal:** Build robust data ingestion and storage

1. ✅ Refactor scraper as modular service
2. ✅ Create Drizzle schema for trading signals
3. ✅ Build data transformation layer
4. ✅ Implement upsert logic (handle duplicates)
5. ✅ Create API endpoint for manual scraping
6. ✅ Set up GitHub Actions for scheduled scraping (free)
7. ✅ Add error handling and logging
8. ✅ Optimize for Vercel serverless limits (10s timeout)

**Deliverables:**
- Automated scraping service
- Data stored in Supabase (free tier)
- API to trigger scrapes manually
- GitHub Actions workflow for scheduled scraping
- Data validation
- Note: Scraping runs via GitHub Actions (free) or local execution

### Phase 3: Core Dashboard (Week 2-3)
**Goal:** Build main data visualization interface

1. ✅ Signals table with sorting/filtering
2. ✅ Sector overview cards
3. ✅ Basic charts (sector distribution, risk levels)
4. ✅ Search and filter functionality
5. ✅ Pagination and data loading

**Deliverables:**
- Functional dashboard
- Data tables
- Basic visualizations
- Search/filter working

### Phase 4: Advanced Analytics (Week 3-4)
**Goal:** Implement unique insights and analysis

1. ✅ Risk-Reward scoring algorithm
2. ✅ Sector performance analysis
3. ✅ Technical pattern detection
4. ✅ Momentum scoring
5. ✅ Custom analysis views
6. ✅ Export functionality

**Deliverables:**
- Analysis algorithms
- Advanced visualizations
- Insight generation
- Export features

### Phase 5: Advanced Visualizations (Week 4-5)
**Goal:** Rich, interactive data visualizations

1. ✅ Interactive charts (Recharts/Chart.js)
2. ✅ Heatmaps (sector vs indicators)
3. ✅ Correlation matrices
4. ✅ Time-series charts (if historical data)
5. ✅ Comparison views
6. ✅ Dashboard widgets

**Deliverables:**
- Interactive charts
- Heatmaps
- Comparison tools
- Widget system

### Phase 6: Portfolio & Alerts (Week 5-6)
**Goal:** User features for practical use

1. ✅ Watchlist functionality
2. ✅ Custom alert system
3. ✅ Portfolio builder
4. ✅ Performance tracking
5. ✅ Notification system

**Deliverables:**
- Watchlist feature
- Alert system
- Portfolio tools
- Notifications

---

## 🎨 Key Features & Pages

### 1. Dashboard (`/`)
- **Overview Cards:** Total signals, sectors, risk distribution
- **Quick Stats:** Best/worst performers, top sectors
- **Recent Activity:** Latest scrapes, updates
- **Quick Actions:** Trigger scrape, view alerts

### 2. Signals Table (`/signals`)
- **Data Table:** All signals with sorting/filtering
- **Filters:** Sector, Risk, Technical Summary, Price range
- **Columns:** Key metrics with color coding
- **Actions:** View details, add to watchlist

### 3. Signal Detail (`/signals/[symbol]`)
- **Full Signal Data:** All indicators
- **Historical Chart:** If we track history
- **Technical Analysis:** Visual indicators
- **Related Signals:** Same sector, similar patterns

### 4. Sector Analysis (`/analysis/sectors`)
- **Sector Performance:** Cards with key metrics
- **Sector Comparison:** Side-by-side charts
- **Sector Heatmap:** Visual sector strength
- **Top Stocks by Sector:** Best performers

### 5. Technical Analysis (`/analysis/technical`)
- **Pattern Detection:** Golden cross, divergences
- **Momentum Analysis:** Momentum scoring
- **Indicator Correlation:** Correlation matrix
- **Oversold/Overbought:** Cluster analysis

### 6. Risk-Reward (`/analysis/risk-reward`)
- **Scoring System:** Custom algorithm
- **Opportunity Ranking:** Best risk-adjusted plays
- **Risk Distribution:** Visual risk breakdown
- **Filter by Score:** Find high-probability setups

### 7. Portfolio Builder (`/portfolio`)
- **Watchlist:** Custom stock lists
- **Portfolio Analysis:** Diversification metrics
- **Performance Tracking:** Track selected stocks
- **Export:** Export portfolio data

### 8. Alerts (`/alerts`)
- **Alert Rules:** Custom thresholds
- **Active Alerts:** Current notifications
- **Alert History:** Past alerts
- **Settings:** Configure notifications

---

## 🔧 Technical Implementation Details

### Database Schema (Drizzle)

```typescript
// Key tables:
- trading_signals (main data)
- scrape_runs (track scraping history)
- watchlists (user watchlists)
- alerts (alert configurations)
- alert_history (alert triggers)
```

### Analysis Algorithms

1. **Risk-Reward Score:**
   ```
   Score = (RSI_weight * RSI_normalized) + 
           (MACD_weight * MACD_score) + 
           (Volume_weight * Volume_trend) - 
           (Risk_penalty * Risk_level)
   ```

2. **Momentum Score:**
   ```
   Momentum = (RSI + StochRSI + CCI_normalized) / 3
   ```

3. **Pattern Detection:**
   - Golden Cross: 50SMA > 200SMA AND 5SMA > 20SMA
   - Death Cross: Opposite
   - Oversold: RSI < 30 AND StochRSI < 20
   - Overbought: RSI > 70 AND StochRSI > 80

### API Endpoints

```
GET  /api/signals              # List all signals
GET  /api/signals/[symbol]     # Get signal by symbol
GET  /api/signals/filter       # Filtered signals
GET  /api/analysis/sectors     # Sector analysis
GET  /api/analysis/technical   # Technical analysis
GET  /api/analysis/risk-reward # Risk-reward scores
POST /api/scrape               # Trigger scrape
GET  /api/stats                # Overall statistics
```

---

## 🚀 Getting Started Checklist (100% Free Setup)

### Step 1: Free Accounts Setup
- [ ] Create Supabase account (free, no credit card)
  - Go to supabase.com
  - Create new project
  - Get connection string
- [ ] Create Vercel account (free, no credit card)
  - Go to vercel.com
  - Sign up with GitHub
- [ ] Create GitHub account (if don't have one, free)

### Step 2: Local Development Setup
- [ ] Set up Next.js project with Bun
- [ ] Configure Supabase connection
- [ ] Set up Drizzle ORM
- [ ] Create database schema
- [ ] Install shadcn/ui
- [ ] Configure Tailwind CSS
- [ ] Convert scraper to TypeScript
- [ ] Create API routes
- [ ] Build first dashboard page
- [ ] Test end-to-end flow locally

### Step 3: Deployment Setup
- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Add environment variables in Vercel (Supabase connection)
- [ ] Deploy to Vercel (automatic)
- [ ] Set up GitHub Actions for scraping
- [ ] Test deployed application

### Step 4: Scraping Setup
- [ ] Create GitHub Actions workflow file
- [ ] Configure cron schedule (daily scraping)
- [ ] Add Supabase secrets to GitHub
- [ ] Test scraping workflow
- [ ] Set up manual scrape API endpoint

---

## 💡 Future Enhancements

1. **Historical Tracking:** Store daily snapshots for trend analysis
2. **Machine Learning:** Predict signal effectiveness
3. **Backtesting:** Test strategies on historical data
4. **Real-time Updates:** WebSocket for live data
5. **Mobile App:** React Native companion
6. **Social Features:** Share insights, community
7. **API for External Use:** Public API for developers
8. **Advanced Charts:** Candlestick, volume profiles
9. **Screener:** Advanced stock screener
10. **Export/Import:** CSV, Excel, PDF reports

---

## 📝 Notes & Considerations

### Free Tier Limitations & Solutions

**Supabase Free Tier:**
- ✅ 500MB database storage (enough for ~100k+ records)
- ✅ 2GB bandwidth/month
- ✅ No credit card required
- ⚠️ Solution: Optimize data storage, use efficient queries

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (10s timeout limit)
- ⚠️ Solution: Scraping via GitHub Actions, not Vercel functions

**GitHub Actions Free Tier:**
- ✅ 2,000 minutes/month for private repos
- ✅ Unlimited for public repos
- ✅ Perfect for scheduled scraping jobs
- ⚠️ Solution: Use public repo or optimize job runtime

**Scraping Strategy:**
1. **Option 1:** GitHub Actions cron job (daily/hourly scraping)
2. **Option 2:** Manual trigger via API (user clicks button)
3. **Option 3:** Local scraping script (user runs on their machine)
4. **Best:** Hybrid - GitHub Actions for scheduled + API for manual

**Data Storage Optimization:**
- Store only latest snapshot (not full history initially)
- Use efficient indexes
- Implement data cleanup for old records
- Compress JSON if storing historical data

**Performance:**
- Optimize queries for large datasets
- Use Next.js caching (ISR) for frequently accessed data
- Implement pagination for large tables
- Use database indexes strategically

**Error Handling:**
- Robust error handling for scraping failures
- Retry logic for transient failures
- Graceful degradation if scraping fails

**Cost Management:**
- Monitor Supabase usage (free tier limits)
- Optimize GitHub Actions runtime
- Use efficient database queries
- Cache aggressively

---

## 🎯 Success Metrics

- ✅ All signals stored in database
- ✅ Dashboard loads in < 2 seconds
- ✅ Real-time filtering works smoothly
- ✅ Charts render correctly
- ✅ Analysis algorithms produce meaningful insights
- ✅ Users can create watchlists and alerts
- ✅ Scraping runs reliably

---

## 💰 Cost Breakdown: $0 Total

| Service | Cost | Notes |
|---------|------|-------|
| Bun Runtime | FREE | Open-source |
| Next.js | FREE | Open-source framework |
| Supabase Database | FREE | 500MB storage, no credit card |
| Vercel Hosting | FREE | Hobby plan, no credit card |
| GitHub Actions | FREE | 2,000 min/month (private) or unlimited (public) |
| Drizzle ORM | FREE | Open-source |
| shadcn/ui | FREE | Open-source components |
| Tailwind CSS | FREE | Open-source |
| Recharts | FREE | Open-source |
| Puppeteer | FREE | Open-source |
| **TOTAL** | **$0** | **Everything is free!** |

---

## 🎯 Free Tier Optimization Tips

1. **Database:**
   - Store only essential data
   - Use efficient data types
   - Implement data archiving for old records
   - Monitor usage in Supabase dashboard

2. **Hosting:**
   - Use Next.js ISR for caching
   - Optimize bundle size
   - Use efficient queries
   - Implement pagination

3. **Scraping:**
   - Run scraping via GitHub Actions (not Vercel functions)
   - Optimize scraping time (reduce wait times if possible)
   - Use efficient selectors
   - Cache results when possible

4. **Bandwidth:**
   - Use Next.js image optimization
   - Compress API responses
   - Implement client-side caching
   - Use CDN (Vercel provides free CDN)

---

**Ready to start building? Everything is 100% free! 🚀**

