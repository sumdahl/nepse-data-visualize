import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BarChart3, Activity, LayoutDashboard, Star } from 'lucide-react';
import { MobileNav } from '@/components/layout/sidebar';
import { WatchlistIndicator } from '@/components/watchlist/watchlist-indicator';

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">NEPSE Signals</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/signals"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Activity className="h-4 w-4" />
            Signals
          </Link>
          <Link
            href="/analysis"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            Analysis
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <WatchlistIndicator />
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link href="https://github.com/sumdahl/nepse-data-visualize" target="_blank">
              GitHub
            </Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
}
