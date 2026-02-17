import type { CleanedSignal } from '@/types/cleaned';
import { encodeSentiment, encodeTrend, encodeVolume, encodeRisk, encodeSMA } from '@/lib/utils/encoders';

export function encodeSignal(signal: CleanedSignal, rawData: { [key: string]: string }): CleanedSignal {
  return {
    ...signal,
    technical_summary: encodeSentiment(rawData.technicalSummary || 'Neutral'),
    technical_risk: encodeRisk(rawData.technicalEntryRisk || 'Medium Risk'),
    macd_signal: encodeTrend(rawData.macdVsSignalLine || 'Neutral'),
    sma5_above_sma20: encodeTrend(rawData.sma5Above20SMA || 'Neutral'),
    sma50_vs_sma200: encodeTrend(rawData.sma50_200 || 'Neutral'),
    volume_trend: encodeVolume(rawData.volumeTrend || 'Neutral'),
    price_above_sma10: encodeSMA(rawData.sma10 || ''),
    price_above_sma20: encodeSMA(rawData.priceAbove20SMA || ''),
    price_above_sma50: encodeSMA(rawData.priceAbove50SMA || ''),
    price_above_sma200: encodeSMA(rawData.priceAbove200SMA || ''),
  };
}

export type RawDataMap = Map<string, { [key: string]: string }>;

export function encodeSignals(
  signals: CleanedSignal[], 
  rawDataMap: RawDataMap
): CleanedSignal[] {
  return signals.map(signal => {
    const raw = rawDataMap.get(signal.symbol);
    if (!raw) return signal;
    return encodeSignal(signal, raw);
  });
}

export function buildRawDataMap(rawSignals: Array<{ symbol: string; [key: string]: any }>): RawDataMap {
  const map: RawDataMap = new Map();
  
  for (const signal of rawSignals) {
    map.set(signal.symbol, signal);
  }
  
  return map;
}