/**
 * Badge color utilities for technical summaries and risk levels
 * Centralized logic to ensure consistency across the application
 */

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Get badge color variant based on technical summary
 * @param summary - Technical summary string (e.g., "Strong Bullish", "Bearish")
 * @returns Badge variant for styling
 */
export function getSummaryColor(summary: string | null): BadgeVariant {
  if (!summary) return "secondary";
  if (summary.includes("Strong Bullish")) return "default";
  if (summary.includes("Bullish")) return "secondary";
  if (summary.includes("Bearish")) return "destructive";
  return "outline";
}

/**
 * Get badge color variant based on risk level
 * @param risk - Risk level string (e.g., "High Risk", "Medium Risk", "Low Risk")
 * @returns Badge variant for styling
 */
export function getRiskColor(risk: string | null): BadgeVariant {
  if (!risk) return "secondary";
  if (risk.includes("High")) return "destructive";
  if (risk.includes("Medium")) return "default";
  return "secondary";
}
