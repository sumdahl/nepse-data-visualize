/**
 * Data formatting utilities for consistent data transformation
 */

/**
 * Parse gain percentage string to number
 * @param gain - Gain string (e.g., "5.23%", "-2.1%")
 * @returns Numeric value of the gain
 */
export function parseGain(gain: string | null): number {
  if (!gain) return 0;
  return parseFloat(gain.replace("%", "").replace(",", "")) || 0;
}

/**
 * Format number as currency
 * @param value - Numeric value
 * @returns Formatted currency string (e.g., "Rs. 1,234.56")
 */
export function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format number as percentage
 * @param value - Numeric value (e.g., 5.23)
 * @returns Formatted percentage string (e.g., "5.23%")
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format date to locale string
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-NP");
}
