import { db } from "../lib/db/index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Testing database connection...");
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    console.log("✅ Connection successful:", result);
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
}

main();
