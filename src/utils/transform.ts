import { TradingSignal, DatabaseSignal } from "../types/index.js";

/**
 * Converts raw scraped data to TradingSignal format
 */
export function transformRawData(rawData: Record<string, string>): TradingSignal {
  // Helper to parse percentage strings
  const parsePercentage = (str: string): string => str.trim();
  
  // Helper to parse numeric values
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[%,]/g, '').trim();
    return parseFloat(cleaned) || 0;
  };

  return {
    symbol: rawData["Symbol"] || "",
    technicalSummary: rawData["Technical Summary"] || "",
    technicalEntryRisk: rawData["Technical Entry Risk"] || "",
    sector: rawData["Sector"] || "",
    dailyGain: parsePercentage(rawData["Daily Gain"] || "0%"),
    ltp: parseNumber(rawData["LTP"] || "0"),
    dailyVolatility: parsePercentage(rawData["Daily Volatility"] || "0%"),
    priceRelative: parsePercentage(rawData["PRICE RELATIVE"] || "0%"),
    trend3M: rawData["3M TREND"] || "",
    rsi14: parseNumber(rawData["RSI 14"] || "0"),
    macdVsSignalLine: rawData["MACD VS Signal Line"] || "",
    percentB: parsePercentage(rawData["%B"] || "0%"),
    mfi14: parseNumber(rawData["MFI 14"] || "0"),
    sto14: parseNumber(rawData["Sto.14"] || "0"),
    cci14: parseNumber(rawData["14-day CCI"] || "0"),
    stochRSI: parseNumber(rawData["StochRSI"] || "0"),
    sma10: rawData["10SMA"] || "",
    priceAbove20SMA: rawData["Price > 20SMA"] || "",
    priceAbove50SMA: rawData["Price > 50SMA"] || "",
    priceAbove200SMA: rawData["Price > 200SMA"] || "",
    sma5Above20SMA: rawData["5SMA > 20SMA"] || "",
    sma50_200: rawData["SMA 50,200"] || "",
    volumeTrend: rawData["Volume Trend"] || "",
    beta3Month: parseNumber(rawData["3 Month Beta"] || "0"),
    scrapedAt: new Date()
  };
}

/**
 * Converts TradingSignal to DatabaseSignal format
 */
export function toDatabaseFormat(signal: TradingSignal): Omit<DatabaseSignal, "id"> {
  return {
    symbol: signal.symbol,
    technical_summary: signal.technicalSummary,
    technical_entry_risk: signal.technicalEntryRisk,
    sector: signal.sector,
    daily_gain: signal.dailyGain,
    ltp: signal.ltp,
    daily_volatility: signal.dailyVolatility,
    price_relative: signal.priceRelative,
    trend_3m: signal.trend3M,
    rsi_14: signal.rsi14,
    macd_vs_signal_line: signal.macdVsSignalLine,
    percent_b: signal.percentB,
    mfi_14: signal.mfi14,
    sto_14: signal.sto14,
    cci_14: signal.cci14,
    stoch_rsi: signal.stochRSI,
    sma_10: signal.sma10,
    price_above_20_sma: signal.priceAbove20SMA,
    price_above_50_sma: signal.priceAbove50SMA,
    price_above_200_sma: signal.priceAbove200SMA,
    sma_5_above_20_sma: signal.sma5Above20SMA,
    sma_50_200: signal.sma50_200,
    volume_trend: signal.volumeTrend,
    beta_3_month: signal.beta3Month,
    scraped_at: signal.scrapedAt || new Date()
  };
}

