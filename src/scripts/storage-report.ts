import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

function coerceNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return Number.NaN;
}

function formatBytes(bytesInput: unknown): string {
  const bytes = coerceNumber(bytesInput);
  if (!Number.isFinite(bytes)) return "n/a";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is missing from .env.local");
    process.exit(1);
  }

  const storageLimitBytes = process.env.DB_STORAGE_LIMIT_BYTES
    ? Number(process.env.DB_STORAGE_LIMIT_BYTES)
    : null;

  const sql = postgres(url, {
    ssl: "require",
    connect_timeout: 10,
    max: 1,
  });

  try {
    const [dbSize] = await sql<{ bytes: number }[]>`
      SELECT pg_database_size(current_database()) AS bytes
    `;
    const [signalsSize] = await sql<{ bytes: number }[]>`
      SELECT pg_total_relation_size('trading_signals') AS bytes
    `;
    const [runsSize] = await sql<{ bytes: number }[]>`
      SELECT pg_total_relation_size('scrape_runs') AS bytes
    `;
    const [daysRow] = await sql<{ days: number }[]>`
      SELECT COUNT(DISTINCT scrape_date)::int AS days
      FROM trading_signals
    `;

    const days = daysRow?.days || 0;
    const avgDailyBytes = days > 0 ? coerceNumber(signalsSize.bytes) / days : 0;

    console.log("PostgreSQL Storage Report");
    console.log("==========================");
    console.log(`Database size: ${formatBytes(dbSize.bytes)} (${dbSize.bytes} bytes)`);
    console.log(`trading_signals size: ${formatBytes(signalsSize.bytes)} (${signalsSize.bytes} bytes)`);
    console.log(`scrape_runs size: ${formatBytes(runsSize.bytes)} (${runsSize.bytes} bytes)`);
    console.log(`Distinct scrape days: ${days}`);
    console.log(
      `Average trading_signals per day: ${avgDailyBytes ? formatBytes(avgDailyBytes) : "n/a"} (${Math.round(avgDailyBytes)} bytes)`
    );

    if (storageLimitBytes && Number.isFinite(storageLimitBytes)) {
      const remainingBytes = Math.max(storageLimitBytes - dbSize.bytes, 0);
      const daysRemaining = avgDailyBytes > 0 ? Math.floor(remainingBytes / avgDailyBytes) : 0;
      console.log("");
      console.log(`Storage limit: ${formatBytes(storageLimitBytes)} (${storageLimitBytes} bytes)`);
      console.log(`Estimated free space: ${formatBytes(remainingBytes)} (${remainingBytes} bytes)`);
      console.log(`Estimated days remaining (signals only): ${daysRemaining}`);
    } else {
      console.log("");
      console.log("Storage limit not set. Provide DB_STORAGE_LIMIT_BYTES to estimate days remaining.");
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("❌ Storage report failed:", error);
  process.exit(1);
});
