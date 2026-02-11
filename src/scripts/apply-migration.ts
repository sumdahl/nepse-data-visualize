import postgres from "postgres";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";

dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing from .env.local");
    process.exit(1);
  }

  const migrationPath = process.argv[2] || "drizzle/0002_add_scrape_date.sql";
  const sqlText = await readFile(migrationPath, "utf8");
  const statements = sqlText
    .split(/;\s*\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

  if (statements.length === 0) {
    console.error("No SQL statements found.");
    process.exit(1);
  }

  const sql = postgres(url, {
    ssl: "require",
    connect_timeout: 10,
    max: 1,
  });

  try {
    console.log(`Applying migration: ${migrationPath}`);
    for (const statement of statements) {
      await sql.unsafe(statement);
    }
    console.log("Migration applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
