import { z } from 'zod';

const percentageRegex = /^-?\d+\.?\d*\s*%$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const isoDatetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export const RawSignalSchema = z.object({
  symbol: z.string().min(1).max(20),
  technicalSummary: z.string(),
  technicalEntryRisk: z.string(),
  sector: z.string().min(1),
  dailyGain: z.string().regex(percentageRegex, 'Invalid percentage format'),
  ltp: z.number().positive(),
  dailyVolatility: z.string().regex(percentageRegex, 'Invalid percentage format'),
  priceRelative: z.string().regex(percentageRegex, 'Invalid percentage format'),
  trend3M: z.enum(['TRENDING', 'MEAN REVERTING']),
  rsi14: z.number().min(0).max(100),
  macdVsSignalLine: z.enum(['Bullish', 'Bearish', 'Neutral']),
  percentB: z.string().regex(percentageRegex, 'Invalid percentage format'),
  mfi14: z.number().min(0).max(100),
  sto14: z.number().min(0).max(100),
  cci14: z.number(),
  stochRSI: z.number().min(0).max(100),
  sma10: z.string(),
  priceAbove20SMA: z.string(),
  priceAbove50SMA: z.string(),
  priceAbove200SMA: z.string(),
  sma5Above20SMA: z.enum(['Bullish', 'Bearish', 'Neutral']),
  sma50_200: z.enum(['Bullish', 'Bearish', 'Neutral']),
  volumeTrend: z.enum(['Trending Up', 'Trending Down', 'Neutral']),
  beta3Month: z.number().positive(),
  scrapedAt: z.string().min(1),
  scrapeDate: z.string().optional(),
});

export const RawSignalArraySchema = z.array(RawSignalSchema);

export const RawMetadataSchema = z.object({
  totalRecords: z.number().int().nonnegative(),
  scrapedAt: z.string().min(1),
  scrapeDate: z.string().regex(isoDateRegex),
  source: z.string(),
  version: z.string(),
});

export const RawFileSchema = z.object({
  metadata: RawMetadataSchema,
  records: RawSignalArraySchema,
});

export type RawSignalSchemaType = z.infer<typeof RawSignalSchema>;
export type RawFileSchemaType = z.infer<typeof RawFileSchema>;

export class PipelineValidationError extends Error {
  constructor(
    public issues: z.ZodIssue[],
    message?: string
  ) {
    super(message || 'Pipeline validation failed');
    this.name = 'PipelineValidationError';
  }
}

export function validateSignal(data: unknown): RawSignalSchemaType {
  const result = RawSignalSchema.safeParse(data);
  if (!result.success) {
    throw new PipelineValidationError(result.error.issues);
  }
  return result.data;
}

export function validateSignals(data: unknown): RawSignalSchemaType[] {
  const result = RawSignalArraySchema.safeParse(data);
  if (!result.success) {
    throw new PipelineValidationError(result.error.issues);
  }
  return result.data;
}

export function validateRawFile(data: unknown): RawFileSchemaType {
  const result = RawFileSchema.safeParse(data);
  if (!result.success) {
    throw new PipelineValidationError(result.error.issues);
  }
  return result.data;
}