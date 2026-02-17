export const SENTIMENT_ENCODING = {
  'Strong Bullish': 2,
  'Medium Bullish': 1,
  'Weak Bullish': 0.5,
  'Neutral': 0,
  'Weak Bearish': -0.5,
  'Bearish': -1,
  'Strong Bearish': -2,
} as const;

export const TREND_ENCODING = {
  'Bullish': 1,
  'Neutral': 0,
  'Bearish': -1,
} as const;

export const VOLUME_ENCODING = {
  'Trending Up': 1,
  'Neutral': 0,
  'Trending Down': -1,
} as const;

export const RISK_ENCODING = {
  'Low Risk': 0,
  'Medium Risk': 1,
  'High Risk': 2,
} as const;

export const SMA_ENCODING = {
  'Price Above Moving Average': true,
  'Price Below Moving Average': false,
} as const;

export const RSI_THRESHOLDS = {
  OVERBOUGHT: 70,
  OVERSOLD: 30,
  NEUTRAL_HIGH: 60,
  NEUTRAL_LOW: 40,
} as const;

export const FEATURE_WEIGHTS = {
  RSI: 0.30,
  MACD: 0.25,
  MFI: 0.20,
  STOCH: 0.15,
  TREND: 0.10,
} as const;

export const VOLATILITY_PERCENTILES = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
} as const;

export const CCI_THRESHOLDS = {
  OVERBOUGHT: 100,
  OVERSOLD: -100,
} as const;

export type SentimentKey = keyof typeof SENTIMENT_ENCODING;
export type TrendKey = keyof typeof TREND_ENCODING;
export type VolumeKey = keyof typeof VOLUME_ENCODING;
export type RiskKey = keyof typeof RISK_ENCODING;
export type SMAKey = keyof typeof SMA_ENCODING;