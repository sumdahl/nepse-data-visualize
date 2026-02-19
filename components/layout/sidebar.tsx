'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/lib/hooks';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Star,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Signals', href: '/signals', icon: Activity },
  { name: 'Analysis', href: '/analysis', icon: BarChart3 },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { count } = useWatchlist();

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 space-y-1 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
                {item.name === 'Watchlist' && count > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="border-t py-4">
        <Link href="/api/pipeline">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-3" />
            Pipeline Status
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useWatchlist();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
          <nav className="container py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start mb-1"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                    {item.name === 'Watchlist' && count > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
