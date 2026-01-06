import postgres from "postgres";
import dotenv from "dotenv";

// Load .env.local manually since we're running this script directly
dotenv.config({ path: ".env.local" });

async function testConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is missing from .env.local");
    process.exit(1);
  }

  // Mask password for logging
  const maskedUrl = url.replace(/:([^:@]+)@/, ":****@");
  console.log(`Testing connection to: ${maskedUrl}`);

  // Check for SSL params
  if (!url.includes("sslmode=require")) {
    console.warn("⚠️  Warning: 'sslmode=require' is missing from the connection string. Supabase requires SSL.");
  }

  // Try connecting with explicit SSL
  console.log("\nAttempting connection with ssl: 'require'...");
  const sql = postgres(url, {
    ssl: 'require',
    connect_timeout: 5,
    max: 1
  });

  try {
    const start = Date.now();
    const result = await sql`SELECT version()`;
    console.log(`✅ Connection successful! (${Date.now() - start}ms)`);
    console.log(`   Version: ${result[0].version}`);
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", (error as any).message);
    if ((error as any).code) console.error("   Code:", (error as any).code);
    await sql.end();
    process.exit(1);
  }
}

testConnection();
