export function parsePercentage(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  const cleaned = value.replace(/[%\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleaned = value.replace(/[%,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function normalizePercentage(value: string): number {
  return parsePercentage(value);
}

export function toFixed(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getDatePath(date: string): { year: string; month: string; day: string } {
  const [year, month, day] = date.split('-');
  return { year, month, day };
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function timestamp(): string {
  return new Date().toISOString();
}

export function timeOnly(): string {
  return new Date().toISOString().slice(11, 19).replace(/:/g, '');
}