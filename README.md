# NEPSE Trading Signals Dashboard

A full-stack Next.js application for scraping, storing, and visualizing NEPSE (Nepal Stock Exchange) trading signals.

## 🚀 Features

- **Automated Daily Scraping**: Runs at 5 PM Nepal Time via GitHub Actions
- **Real-time Dashboard**: View trading signals with beautiful UI
- **Data Analysis**: Sector analysis, technical indicators, and more
- **100% Free**: Uses Supabase (free tier), Vercel (free tier), and GitHub Actions

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: Bun
- **React**: 19.2.0
- **TypeScript**: 5.9.2
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM 0.36.4
- **UI**: shadcn/ui + Tailwind CSS 4.1.13
- **Charts**: Recharts 2.15.0
- **Scraping**: Puppeteer 24.8.2

> All packages are updated to latest versions as of November 2025. See `PACKAGE_VERSIONS.md` for details.

## 📋 Prerequisites

- Bun installed ([bun.sh](https://bun.sh))
- Supabase account (free)
- GitHub account (free)

## 🏃 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

Get your connection string from Supabase Dashboard → Settings → Database

### 3. Set Up Database

```bash
# Generate migration
bun run db:generate

# Apply migration
bun run db:migrate
```

Or manually create the table in Supabase SQL Editor (see `SCRAPING_SETUP.md`)

### 4. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
nepse-scrape/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── signals/          # Signals page
│   └── page.tsx          # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── src/
│   ├── lib/              # Utilities
│   │   └── db/           # Database setup
│   ├── scripts/          # Scraper scripts
│   └── types/            # TypeScript types
└── .github/workflows/     # GitHub Actions
```

## 🔄 Daily Scraping

The scraper runs automatically at **5 PM Nepal Time** via GitHub Actions.

### Manual Scraping

```bash
bun run scrape
```

### Set Up GitHub Actions

1. Add `DATABASE_URL` secret to GitHub (Settings → Secrets → Actions)
2. Push code to GitHub
3. Workflow runs automatically daily

See `README_SCRAPING.md` for detailed setup.

## 📊 API Endpoints

- `GET /api/signals` - Get all signals (with filters)
- `GET /api/stats` - Get statistics

## 🎨 Pages

- `/` - Dashboard with overview
- `/signals` - All trading signals
- `/analysis` - Analysis dashboard (coming soon)

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy!

### Environment Variables

- `DATABASE_URL` - Supabase PostgreSQL connection string

## 📝 Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run scrape` - Run scraper manually
- `bun run db:generate` - Generate Drizzle migrations
- `bun run db:migrate` - Apply migrations

## 🔧 Development

### Adding New Components

This project uses shadcn/ui. To add components:

```bash
npx shadcn-ui@latest add [component-name]
```

### Database Migrations

```bash
# Generate migration after schema changes
bun run db:generate

# Apply to database
bun run db:migrate
```

## 📚 Documentation

- `PROJECT_PLAN.md` - Full project plan and architecture
- `FREE_SETUP_GUIDE.md` - Step-by-step free setup guide
- `README_SCRAPING.md` - Scraping setup and configuration
- `SCRAPING_SETUP.md` - Quick scraping setup

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure table exists (run migrations)

### Scraping Fails
- Check GitHub Actions logs
- Verify `DATABASE_URL` secret is set
- Check Puppeteer dependencies

### Build Errors
- Run `bun install` to ensure dependencies are installed
- Check TypeScript errors
- Verify environment variables

## 📄 License

ISC

## 🙏 Acknowledgments

- NEPSE Alpha for providing the data source
- All open-source contributors

---

**Built with ❤️ using Next.js, Bun, and Supabase**

