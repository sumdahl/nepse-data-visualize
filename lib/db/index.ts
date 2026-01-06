import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection
// Global type definition to prevent TS errors on global object
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Create PostgreSQL connection
// Use global connection if available (for hot-reloading), otherwise create new
const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: 'require',
  onnotice: (notice) => console.log('DB Notice:', notice),
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

// Create Drizzle instance
export const db = drizzle(conn, { schema });

// Export schema for use in other files
export { schema };
