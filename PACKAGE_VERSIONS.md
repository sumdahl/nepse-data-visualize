# 📦 Package Versions (Updated November 2025)

All packages have been updated to their latest stable versions as of November 2025.

## Core Framework

- **Next.js**: `^16.1.1` - Latest stable version with App Router
- **React**: `^19.2.0` - Latest React with improved performance
- **React DOM**: `^19.2.0` - Matching React version
- **TypeScript**: `^5.9.2` - Latest TypeScript with improved type checking

## Database & ORM

- **Drizzle ORM**: `^0.36.4` - Latest version with improved PostgreSQL support
- **Drizzle Kit**: `^0.30.1` - Latest migration tool
- **Postgres**: `^3.4.3` - PostgreSQL client library

## UI Components

- **Radix UI**: Latest versions of all components
  - `@radix-ui/react-slot`: `^1.1.0`
  - `@radix-ui/react-dialog`: `^1.1.2`
  - `@radix-ui/react-select`: `^2.1.2`
  - `@radix-ui/react-tabs`: `^1.1.1`
  - `@radix-ui/react-label`: `^2.1.0`

## Styling

- **Tailwind CSS**: `^4.1.13` - Latest version with new features
- **Tailwind Merge**: `^2.5.4` - Utility for merging Tailwind classes
- **Tailwind Animate**: `^1.0.7` - Animation utilities
- **PostCSS**: `^8.4.47` - CSS processor
- **Autoprefixer**: `^10.4.20` - CSS vendor prefixer

## Utilities

- **Class Variance Authority**: `^0.7.1` - Component variant management
- **clsx**: `^2.1.1` - Conditional class names
- **Lucide React**: `^0.468.0` - Icon library
- **date-fns**: `^4.1.0` - Date utility library
- **Recharts**: `^2.15.0` - Charting library

## Development Tools

- **ESLint**: `^9.18.0` - Latest linter
- **ESLint Config Next**: `^16.1.1` - Next.js ESLint config
- **Type Definitions**:
  - `@types/node`: `^22.10.2`
  - `@types/react`: `^19.0.6`
  - `@types/react-dom`: `^19.0.2`

## Scraping

- **Puppeteer**: `^24.8.2` - Web scraping library

## Runtime

- **Bun**: Latest (via `@types/bun: latest`)

## Breaking Changes & Updates

### Next.js 16
- Server Actions are now stable (no longer experimental)
- Improved performance and caching
- Better TypeScript support

### React 19
- Improved hydration
- Better server component support
- Enhanced performance

### Drizzle ORM 0.36
- Updated config format (uses `dialect` instead of `driver`)
- Improved type inference
- Better migration system

### Tailwind CSS 4
- New configuration format
- Improved performance
- Better dark mode support

## Installation

To install all packages with latest versions:

```bash
bun install
```

Or if using npm:

```bash
npm install
```

## Verification

Check installed versions:

```bash
# Check Next.js version
bunx next --version

# Check React version
bunx react --version

# Check all package versions
bun list
```

## Notes

- All versions use `^` (caret) to allow patch and minor updates
- Major versions are locked to ensure compatibility
- Type definitions match the runtime package versions
- All packages are compatible with Bun runtime

---

**Last Updated**: November 2025
**Next.js Version**: 16.1.1
**React Version**: 19.2.0

