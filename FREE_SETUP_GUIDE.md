# 🆓 Free Setup Guide - No Credit Card Required

This guide will help you set up the entire project using only free services.

## 📋 Prerequisites

- GitHub account (free)
- Email address
- No credit card needed!

---

## Step 1: Create Free Accounts

### 1.1 Supabase (Database) - FREE
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (easiest)
4. Click "New Project"
5. Fill in:
   - **Name:** nepse-scrape (or any name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free (default)
6. Click "Create new project"
7. Wait 2-3 minutes for setup
8. Once ready, go to **Settings** → **Database**
9. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
10. Save this connection string - you'll need it!

**Free Tier Limits:**
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ No credit card required
- ✅ Perfect for this project!

---

### 1.2 Vercel (Hosting) - FREE
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (easiest)
4. That's it! No credit card needed.

**Free Tier Limits:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Perfect for Next.js!

---

### 1.3 GitHub (Code Repository) - FREE
1. If you don't have GitHub: [github.com](https://github.com)
2. Sign up (free)
3. Create a new repository
4. Make it **public** (for unlimited GitHub Actions) or **private** (2,000 min/month)

**Free Tier:**
- ✅ Unlimited public repos
- ✅ 2,000 minutes/month for private repos (GitHub Actions)
- ✅ Unlimited minutes for public repos

---

## Step 2: Local Development Setup

### 2.1 Install Bun
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Or use npm
npm install -g bun
```

### 2.2 Clone/Initialize Project
```bash
# If you have the project locally
cd nepse-scrape

# Or create new Next.js project
bun create next-app nepse-scrape
cd nepse-scrape
```

### 2.3 Install Dependencies
```bash
bun install
```

### 2.4 Set Up Environment Variables
Create `.env.local` file:
```env
# Supabase Connection (from Step 1.1)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres

# Optional: For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Database Setup

### 3.1 Install Drizzle
```bash
bun add drizzle-orm @supabase/supabase-js
bun add -d drizzle-kit
```

### 3.2 Create Drizzle Config
Create `drizzle.config.ts`:
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 3.3 Run Migrations
```bash
# Generate migration
bun run drizzle-kit generate

# Apply to database
bun run drizzle-kit push
```

---

## Step 4: Deploy to Vercel

### 4.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[YOUR_USERNAME]/nepse-scrape.git
git push -u origin main
```

### 4.2 Connect to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string
5. Click "Deploy"
6. Wait for deployment (2-3 minutes)
7. Your app is live! 🎉

---

## Step 5: Set Up Automated Scraping (GitHub Actions)

### 5.1 Create Workflow File
Create `.github/workflows/scrape.yml`:
```yaml
name: Scrape NEPSE Data

on:
  schedule:
    # Run daily at 2 AM UTC (adjust to your timezone)
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run scraper
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: bun run src/scripts/scrape.ts
```

### 5.2 Add Secrets to GitHub
1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string
5. Click "Add secret"

### 5.3 Test Workflow
1. Go to **Actions** tab in GitHub
2. Click "Scrape NEPSE Data"
3. Click "Run workflow"
4. Watch it run!

---

## Step 6: Verify Everything Works

### 6.1 Check Database
1. Go to Supabase dashboard
2. Click **Table Editor**
3. You should see `trading_signals` table
4. Check if data is being inserted

### 6.2 Check Website
1. Go to your Vercel URL
2. You should see the dashboard
3. Check if data loads correctly

### 6.3 Check Scraping
1. Go to GitHub Actions
2. Verify workflow runs successfully
3. Check database for new data

---

## 🎉 You're All Set!

Everything is now running for **FREE**:
- ✅ Database: Supabase (free tier)
- ✅ Hosting: Vercel (free tier)
- ✅ Scraping: GitHub Actions (free tier)
- ✅ Total Cost: **$0**

---

## 📊 Monitoring Free Tier Usage

### Supabase
- Go to **Settings** → **Usage**
- Monitor database size (500MB limit)
- Monitor bandwidth (2GB/month)

### Vercel
- Go to **Settings** → **Usage**
- Monitor bandwidth (100GB/month)
- Usually plenty for this project!

### GitHub Actions
- Go to **Settings** → **Actions** → **Usage**
- Monitor minutes used
- Public repos: Unlimited
- Private repos: 2,000 min/month

---

## 🆘 Troubleshooting

### Database Connection Issues
- Check connection string format
- Verify password is correct
- Check if project is active in Supabase

### Vercel Deployment Issues
- Check environment variables are set
- Verify build logs
- Check Next.js configuration

### GitHub Actions Fails
- Check secrets are set correctly
- Verify DATABASE_URL format
- Check workflow logs for errors

### Scraping Takes Too Long
- Optimize scraping script
- Reduce wait times if possible
- Consider running less frequently

---

## 💡 Tips to Stay Within Free Limits

1. **Database:**
   - Store only latest snapshot (not full history)
   - Archive old data periodically
   - Use efficient data types

2. **Bandwidth:**
   - Use Next.js image optimization
   - Implement caching
   - Compress API responses

3. **GitHub Actions:**
   - Optimize scraping time
   - Run less frequently if needed
   - Use public repo for unlimited minutes

---

**Need help? Check the main PROJECT_PLAN.md for detailed architecture!**

