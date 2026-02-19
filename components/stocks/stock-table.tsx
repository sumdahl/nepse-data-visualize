'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScoreIndicator, ZoneBadge } from '@/components/shared/score-indicator';
import { TrendBadge } from '@/components/shared/trend-badge';
import { WatchlistButton } from '@/components/watchlist/watchlist-button';
import { ArrowUpDown, Eye } from 'lucide-react';
import Link from 'next/link';
import type { FeaturedSignal } from '@/types/features';

interface StockTableProps {
  signals: FeaturedSignal[];
  sortBy?: string;
  onSort?: (column: string) => void;
}

type SortKey = 'symbol' | 'ltp' | 'daily_gain_pct' | 'momentum_score' | 'signal_composite' | 'rsi_14';

export function StockTable({ signals, sortBy, onSort }: StockTableProps) {
  const sortedSignals = [...signals].sort((a, b) => {
    switch (sortBy) {
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      case 'ltp':
        return b.ltp - a.ltp;
      case 'gain':
      case 'daily_gain_pct':
        return b.daily_gain_pct - a.daily_gain_pct;
      case 'momentum':
      case 'momentum_score':
        return b.momentum_score - a.momentum_score;
      case 'rsi':
      case 'rsi_14':
        return b.rsi_14 - a.rsi_14;
      case 'composite':
      case 'signal_composite':
      default:
        return b.signal_composite - a.signal_composite;
    }
  });

  const handleSort = (column: string) => {
    onSort?.(column);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" onClick={() => handleSort('symbol')}>
                Symbol
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Sector</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" size="sm" onClick={() => handleSort('ltp')}>
                LTP
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" size="sm" onClick={() => handleSort('daily_gain_pct')}>
                Daily Gain
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" onClick={() => handleSort('rsi_14')}>
                RSI
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Momentum</TableHead>
            <TableHead>Composite</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSignals.map((signal, index) => (
            <TableRow key={`${signal.symbol}-${signal.scrape_date}-${index}`}>
              <TableCell>
                <WatchlistButton symbol={signal.symbol} />
              </TableCell>
              <TableCell className="font-bold">
                <Link href={`/stock/${signal.symbol}`} className="hover:underline">
                  {signal.symbol}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{signal.sector}</TableCell>
              <TableCell className="text-right font-medium">
                Rs. {signal.ltp.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <TrendBadge value={signal.daily_gain_pct} type="gain" />
              </TableCell>
              <TableCell>
                <TrendBadge value={signal.technical_summary} type="sentiment" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{signal.rsi_14.toFixed(1)}</span>
                  <ZoneBadge rsi={signal.rsi_14} />
                </div>
              </TableCell>
              <TableCell>
                <ScoreIndicator score={signal.momentum_score} showLabel={false} size="sm" />
              </TableCell>
              <TableCell>
                <ScoreIndicator score={signal.signal_composite} showLabel={false} size="sm" />
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/stock/${signal.symbol}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
