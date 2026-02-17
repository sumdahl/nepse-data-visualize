import {
  SENTIMENT_ENCODING,
  TREND_ENCODING,
  VOLUME_ENCODING,
  RISK_ENCODING,
  SMA_ENCODING,
  type SentimentKey,
  type TrendKey,
  type VolumeKey,
  type RiskKey,
  type SMAKey,
} from '@/lib/constants/mappings';
import type { TrendValue, SentimentValue, RiskValue } from '@/types/cleaned';

export function encodeSentiment(value: string): SentimentValue {
  return SENTIMENT_ENCODING[value as SentimentKey] ?? 0;
}

export function encodeTrend(value: string): TrendValue {
  return TREND_ENCODING[value as TrendKey] ?? 0;
}

export function encodeVolume(value: string): TrendValue {
  return VOLUME_ENCODING[value as VolumeKey] ?? 0;
}

export function encodeRisk(value: string): RiskValue {
  return RISK_ENCODING[value as RiskKey] ?? 1;
}

export function encodeSMA(value: string): boolean {
  return SMA_ENCODING[value as SMAKey] ?? false;
}

export function decodeSentiment(value: SentimentValue): string {
  const entry = Object.entries(SENTIMENT_ENCODING).find(([, v]) => v === value);
  return entry ? entry[0] : 'Neutral';
}

export function decodeTrend(value: TrendValue): string {
  const entry = Object.entries(TREND_ENCODING).find(([, v]) => v === value);
  return entry ? entry[0] : 'Neutral';
}