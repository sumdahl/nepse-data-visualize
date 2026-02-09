import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, Activity, LayoutDashboard } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span>NEPSE Scrape</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
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
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="https://github.com/sumdahl/nepse-scrape" target="_blank">
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
