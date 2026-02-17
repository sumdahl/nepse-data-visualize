export const PIPELINE_CONFIG = {
  paths: {
    raw: 'data/raw/nepse',
    cleaned: 'data/cleaned/nepse',
    features: 'data/features/nepse',
    historical: 'data/historical/nepse_timeseries.jsonl',
  },
  
  validation: {
    strict: true,
    failOnInvalid: true,
  },
  
  features: {
    weights: {
      rsi: 0.30,
      macd: 0.25,
      mfi: 0.20,
      stoch: 0.15,
      trend: 0.10,
    },
    thresholds: {
      overbought: 70,
      oversold: 30,
    },
  },
  
  encoding: {
    sentiment: {
      'Strong Bullish': 2,
      'Medium Bullish': 1,
      'Weak Bullish': 0.5,
      'Neutral': 0,
      'Weak Bearish': -0.5,
      'Bearish': -1,
      'Strong Bearish': -2,
    },
    trend: {
      'Bullish': 1,
      'Neutral': 0,
      'Bearish': -1,
    },
  },
} as const;

export type PipelineConfig = typeof PIPELINE_CONFIG;