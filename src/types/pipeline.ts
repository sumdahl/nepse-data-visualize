import { RawSignal } from './raw.js';
import { CleanedSignal } from './cleaned.js';
import { FeaturedSignal } from './features.js';

export interface PipelineResult {
  status: 'success' | 'no_new_data' | 'error';
  records_processed?: number;
  records_cleaned?: number;
  records_featured?: number;
  date?: string;
  error?: string;
  duration_ms?: number;
}

export interface PipelineOptions {
  date?: string;
  force?: boolean;
  skipFeatures?: boolean;
}

export interface ValidationResult {
  valid: RawSignal[];
  invalid: Array<{ record: unknown; errors: string[] }>;
}

export interface HistoricalQueryOptions {
  symbol?: string;
  sector?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}