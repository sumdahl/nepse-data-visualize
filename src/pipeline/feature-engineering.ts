import type { CleanedSignal } from '@/types/cleaned';
import type { FeaturedSignal, RSIZone, MACDZone } from '@/types/features';
import { FEATURE_WEIGHTS, RSI_THRESHOLDS, CCI_THRESHOLDS } from '@/lib/constants/mappings';
import { clamp, toFixed } from '@/lib/utils/parsers';

export function engineerFeatures(signal: CleanedSignal): FeaturedSignal {
  return {
    ...signal,
    momentum_score: calculateMomentumScore(signal),
    volatility_ratio: calculateVolatilityRatio(signal),
    is_overbought: signal.rsi_14 > RSI_THRESHOLDS.OVERBOUGHT,
    is_oversold: signal.rsi_14 < RSI_THRESHOLDS.OVERSOLD,
    trend_strength: calculateTrendStrength(signal),
    ma_alignment_score: calculateMAAlignment(signal),
    signal_composite: calculateCompositeScore(signal),
    rsi_zone: getRSIZone(signal.rsi_14),
    macd_zone: getMACDZone(signal.macd_signal),
  };
}

export function engineerFeaturesBatch(signals: CleanedSignal[]): FeaturedSignal[] {
  const sectorVolatility = calculateSectorVolatility(signals);
  
  return signals.map(signal => {
    const featured = engineerFeatures(signal);
    featured.volatility_ratio = calculateVolatilityRatioWithContext(
      signal, 
      sectorVolatility[signal.sector]
    );
    return featured;
  });
}

function calculateMomentumScore(s: CleanedSignal): number {
  const rsiWeight = ((s.rsi_14 - 50) / 50) * 30 * FEATURE_WEIGHTS.RSI / 0.3;
  const macdWeight = s.macd_signal * 25 * FEATURE_WEIGHTS.MACD / 0.25;
  const mfiWeight = ((s.mfi_14 - 50) / 50) * 20 * FEATURE_WEIGHTS.MFI / 0.2;
  const stochWeight = ((s.sto_14 - 50) / 50) * 15 * FEATURE_WEIGHTS.STOCH / 0.15;
  const trendWeight = s.sma5_above_sma20 * 10 * FEATURE_WEIGHTS.TREND / 0.1;
  
  return toFixed(clamp(rsiWeight + macdWeight + mfiWeight + stochWeight + trendWeight, -100, 100), 2);
}

function calculateTrendStrength(s: CleanedSignal): number {
  let score = 0;
  
  if (s.price_above_sma10) score += 15;
  if (s.price_above_sma20) score += 20;
  if (s.price_above_sma50) score += 25;
  if (s.price_above_sma200) score += 40;
  
  if (s.sma5_above_sma20 === 1) score += 10;
  if (s.sma50_vs_sma200 === 1) score += 30;
  if (s.sma50_vs_sma200 === -1) score -= 20;
  
  return toFixed(clamp(score, 0, 100), 2);
}

function calculateMAAlignment(s: CleanedSignal): number {
  let score = 0;
  
  if (s.price_above_sma10) score += 1;
  if (s.price_above_sma20) score += 1;
  if (s.price_above_sma50) score += 1;
  if (s.price_above_sma200) score += 1;
  
  if (s.sma50_vs_sma200 === -1) score = -score;
  
  return score;
}

function calculateCompositeScore(s: CleanedSignal): number {
  const momentum = calculateMomentumScore(s) * 0.3;
  const trend = calculateTrendStrength(s) * 0.25;
  const maAlign = calculateMAAlignment(s) * 12.5 * 0.2;
  const sentiment = s.technical_summary * 15 * 0.15;
  const volatility = (50 - Math.abs(s.daily_volatility_pct)) / 50 * 10 * 0.1;
  
  return toFixed(clamp(momentum + trend + maAlign + sentiment + volatility, -100, 100), 2);
}

function calculateVolatilityRatio(s: CleanedSignal): number {
  return toFixed(s.daily_volatility_pct / (s.beta_3m || 1), 4);
}

function calculateVolatilityRatioWithContext(s: CleanedSignal, sectorAvg: number): number {
  const ratio = sectorAvg > 0 ? s.daily_volatility_pct / sectorAvg : 1;
  return toFixed(ratio, 4);
}

function calculateSectorVolatility(signals: CleanedSignal[]): Record<string, number> {
  const sectorMap: Record<string, number[]> = {};
  
  for (const s of signals) {
    if (!sectorMap[s.sector]) {
      sectorMap[s.sector] = [];
    }
    sectorMap[s.sector].push(s.daily_volatility_pct);
  }
  
  const result: Record<string, number> = {};
  
  for (const [sector, volatilities] of Object.entries(sectorMap)) {
    const avg = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;
    result[sector] = toFixed(avg, 4);
  }
  
  return result;
}

function getRSIZone(rsi: number): RSIZone {
  if (rsi > RSI_THRESHOLDS.OVERBOUGHT) return 'overbought';
  if (rsi < RSI_THRESHOLDS.OVERSOLD) return 'oversold';
  return 'neutral';
}

function getMACDZone(macd: number): MACDZone {
  if (macd > 0) return 'bullish';
  if (macd < 0) return 'bearish';
  return 'neutral';
}

export function getOverboughtSignals(signals: FeaturedSignal[]): FeaturedSignal[] {
  return signals.filter(s => s.is_overbought);
}

export function getOversoldSignals(signals: FeaturedSignal[]): FeaturedSignal[] {
  return signals.filter(s => s.is_oversold);
}

export function getBullishSignals(signals: FeaturedSignal[]): FeaturedSignal[] {
  return signals.filter(s => s.signal_composite > 50);
}

export function getBearishSignals(signals: FeaturedSignal[]): FeaturedSignal[] {
  return signals.filter(s => s.signal_composite < -50);
}