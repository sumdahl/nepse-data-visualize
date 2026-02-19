'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';

const WATCHLIST_KEY = 'nepse_watchlist';

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

export function useWatchlist() {
  const { value: watchlist, setValue, isLoading } = useLocalStorage<WatchlistItem[]>(WATCHLIST_KEY, []);

  const addToWatchlist = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    setValue(prev => {
      if (prev.some(item => item.symbol === upperSymbol)) {
        return prev;
      }
      return [...prev, { symbol: upperSymbol, addedAt: new Date().toISOString() }];
    });
  }, [setValue]);

  const removeFromWatchlist = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    setValue(prev => prev.filter(item => item.symbol !== upperSymbol));
  }, [setValue]);

  const toggleWatchlist = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    setValue(prev => {
      const exists = prev.some(item => item.symbol === upperSymbol);
      if (exists) {
        return prev.filter(item => item.symbol !== upperSymbol);
      }
      return [...prev, { symbol: upperSymbol, addedAt: new Date().toISOString() }];
    });
  }, [setValue]);

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.some(item => item.symbol === symbol.toUpperCase());
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    clearWatchlist,
    count: watchlist.length,
  };
}
