# 🕐 Daily Scraping Setup - 5 PM Nepal Time

This project includes automated daily scraping that runs at **5:00 PM Nepal Time (NPT)** every day.

## ⏰ Schedule Details

- **Time:** 5:00 PM Nepal Time (NPT)
- **Frequency:** Daily
- **UTC Equivalent:** 11:15 AM UTC (NPT = UTC+5:45)
- **Cron Expression:** `15 11 * * *`

## 🚀 Setup Instructions

### 1. Create GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string
     - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
     - Get it from Supabase Dashboard → Settings → Database

### 2. Verify Workflow File

The workflow file is located at: `.github/workflows/daily-scrape.yml`

It's already configured to:
- ✅ Run daily at 5 PM Nepal Time
- ✅ Install all dependencies
- ✅ Run the scraper script
- ✅ Handle errors gracefully

### 3. Test the Workflow

#### Option A: Manual Trigger (Recommended for Testing)
1. Go to **Actions** tab in GitHub
2. Click **Daily NEPSE Data Scrape**
3. Click **Run workflow** button
4. Select branch (usually `main`)
5. Click **Run workflow**
6. Watch it execute!

#### Option B: Wait for Scheduled Run
- The workflow will automatically run at 5 PM Nepal Time daily
- Check the **Actions** tab to see execution history

## 📊 Monitoring

### Check Workflow Status
1. Go to **Actions** tab
2. Click on the latest workflow run
3. View logs to see:
   - Scraping progress
   - Number of signals scraped
   - Database save status
   - Any errors

### Check Database
1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Check `trading_signals` table
4. Verify new data is being added

## 🔧 Manual Scraping

You can also run the scraper manually:

### Local Execution
```bash
# Set environment variable
export DATABASE_URL="your-supabase-connection-string"

# Run scraper
bun run scrape
```

### From GitHub Actions
1. Go to **Actions** tab
2. Click **Daily NEPSE Data Scrape**
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## ⚙️ Customizing Schedule

To change the scraping time, edit `.github/workflows/daily-scrape.yml`:

```yaml
schedule:
  # Current: 5 PM Nepal Time (11:15 AM UTC)
  - cron: '15 11 * * *'
  
  # Example: 6 PM Nepal Time (12:15 PM UTC)
  - cron: '15 12 * * *'
  
  # Example: 9 AM Nepal Time (3:15 AM UTC)
  - cron: '15 3 * * *'
```

### Cron Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Nepal Time to UTC Conversion
- Nepal Time (NPT) = UTC + 5:45
- 5:00 PM NPT = 11:15 AM UTC
- Use [crontab.guru](https://crontab.guru) to verify cron expressions

## 🐛 Troubleshooting

### Workflow Fails to Run
- Check if workflow file is in `.github/workflows/` directory
- Verify file is committed to the repository
- Check GitHub Actions is enabled (Settings → Actions → General)

### Scraping Fails
- Check `DATABASE_URL` secret is set correctly
- Verify Supabase connection string format
- Check workflow logs for specific errors
- Ensure Puppeteer dependencies are installed (handled automatically)

### No Data in Database
- Check workflow logs for errors
- Verify database connection string
- Check Supabase project is active
- Verify table exists (run migrations if needed)

### Time Zone Issues
- GitHub Actions uses UTC time
- Nepal Time = UTC + 5:45
- Current schedule: `15 11 * * *` = 11:15 AM UTC = 5:00 PM NPT

## 📈 Expected Behavior

When the workflow runs successfully, you should see:
1. ✅ Browser launches
2. ✅ Navigates to nepsealpha.com
3. ✅ Scrapes all pages of data
4. ✅ Converts to structured format
5. ✅ Saves to Supabase database
6. ✅ Shows statistics (total signals, sectors, etc.)

## 🔔 Notifications (Optional)

You can add email notifications on failure by adding to the workflow:

```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v6
  with:
    script: |
      // Add notification logic here
      console.log('Scraping failed!')
```

## 📝 Notes

- **Free Tier:** GitHub Actions provides 2,000 minutes/month for private repos
- **Public Repos:** Unlimited minutes (consider making repo public if needed)
- **Scraping Time:** Usually takes 5-15 minutes depending on data size
- **Database:** Supabase free tier (500MB) is sufficient for this project

---

**Need help?** Check the main `PROJECT_PLAN.md` or `FREE_SETUP_GUIDE.md` for more details!

