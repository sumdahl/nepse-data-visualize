'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks';

interface StockFiltersProps {
  sectors: string[];
  onFilterChange?: (filters: StockFilterState) => void;
}

export interface StockFilterState {
  search: string;
  sector: string;
  rsiZone: string;
  sentiment: string;
  sortBy: string;
}

const RSI_ZONES = [
  { value: 'all', label: 'All RSI Zones' },
  { value: 'overbought', label: 'Overbought (>70)' },
  { value: 'oversold', label: 'Oversold (<30)' },
  { value: 'neutral', label: 'Neutral (30-70)' },
];

const SENTIMENTS = [
  { value: 'all', label: 'All Sentiments' },
  { value: 'bullish', label: 'Bullish' },
  { value: 'bearish', label: 'Bearish' },
  { value: 'neutral', label: 'Neutral' },
];

const SORT_OPTIONS = [
  { value: 'composite', label: 'Signal Composite' },
  { value: 'momentum', label: 'Momentum Score' },
  { value: 'rsi', label: 'RSI (14)' },
  { value: 'gain', label: 'Daily Gain' },
  { value: 'symbol', label: 'Symbol' },
];

export function StockFilters({ sectors, onFilterChange }: StockFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || 'all');
  const [rsiZone, setRsiZone] = useState(searchParams.get('rsiZone') || 'all');
  const [sentiment, setSentiment] = useState(searchParams.get('sentiment') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'composite');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (sector !== 'all') count++;
    if (rsiZone !== 'all') count++;
    if (sentiment !== 'all') count++;
    return count;
  }, [debouncedSearch, sector, rsiZone, sentiment]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sector !== 'all') params.set('sector', sector);
    if (rsiZone !== 'all') params.set('rsiZone', rsiZone);
    if (sentiment !== 'all') params.set('sentiment', sentiment);
    if (sortBy !== 'composite') params.set('sortBy', sortBy);

    router.push(`/signals?${params.toString()}`);

    onFilterChange?.({
      search: debouncedSearch,
      sector,
      rsiZone,
      sentiment,
      sortBy,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSector('all');
    setRsiZone('all');
    setSentiment('all');
    setSortBy('composite');
    router.push('/signals');
    onFilterChange?.({
      search: '',
      sector: 'all',
      rsiZone: 'all',
      sentiment: 'all',
      sortBy: 'composite',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-10"
          />
        </div>

        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <Button onClick={applyFilters}>Apply</Button>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-4 p-4 rounded-lg border bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">RSI Zone</label>
            <Select value={rsiZone} onValueChange={setRsiZone}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RSI_ZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sentiment</label>
            <Select value={sentiment} onValueChange={setSentiment}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENTIMENTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
