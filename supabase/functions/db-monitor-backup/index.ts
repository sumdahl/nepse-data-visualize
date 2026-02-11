import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BACKUP_BUCKET = Deno.env.get("BACKUP_BUCKET") ?? "backups";
const DB_MAX_BYTES = Number(Deno.env.get("DB_MAX_BYTES") ?? "524288000"); // 500 MiB
const THRESHOLD = Number(Deno.env.get("DB_THRESHOLD") ?? "0.8");
const BACKUP_TABLES = Deno.env.get("BACKUP_TABLES") ?? ""; // comma-separated

// Email via Resend
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const ALERT_EMAIL_TO = Deno.env.get("ALERT_EMAIL_TO") ?? "";
const ALERT_EMAIL_FROM = Deno.env.get("ALERT_EMAIL_FROM") ?? "";
const ALERT_EMAIL_SUBJECT_PREFIX = Deno.env.get("ALERT_EMAIL_SUBJECT_PREFIX") ?? "[DB Warning]";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  return lines.join("\n");
}

async function sendHighPriorityEmail(subject: string, text: string) {
  if (!RESEND_API_KEY || !ALERT_EMAIL_TO || !ALERT_EMAIL_FROM) return;

  const payload = {
    from: ALERT_EMAIL_FROM,
    to: [ALERT_EMAIL_TO],
    subject: `${ALERT_EMAIL_SUBJECT_PREFIX} ${subject}`,
    text,
    headers: {
      "X-Priority": "1 (Highest)",
      "Importance": "High",
    },
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Idempotency-Key": `db-alert-${crypto.randomUUID()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend error ${response.status}: ${body}`);
  }
}

async function getTables(): Promise<string[]> {
  if (BACKUP_TABLES.trim()) {
    return BACKUP_TABLES.split(",").map((t) => t.trim()).filter(Boolean);
  }
  const { data, error } = await supabase.rpc("list_public_tables");
  if (error) throw error;
  return data?.map((r: { table_name: string }) => r.table_name) ?? [];
}

async function exportTable(table: string, dateStamp: string) {
  const pageSize = 1000;
  let from = 0;
  let allRows: Record<string, unknown>[] = [];

  while (true) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data as Record<string, unknown>[]);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const csv = toCsv(allRows);
  const filename = `backup-${dateStamp}-${table}.csv`;
  const { error: uploadError } = await supabase.storage
    .from(BACKUP_BUCKET)
    .upload(filename, new Blob([csv], { type: "text/csv" }), { upsert: true });
  if (uploadError) throw uploadError;
}

Deno.serve(async () => {
  const dateStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const { data: dbSizeRows, error: dbSizeError } = await supabase.rpc("get_database_size");
    if (dbSizeError) throw dbSizeError;
    const dbBytes = coerceNumber(dbSizeRows?.[0]?.bytes ?? 0);
    const dbPct = DB_MAX_BYTES > 0 ? (dbBytes / DB_MAX_BYTES) * 100 : 0;

    const { data: sizes, error } = await supabase.rpc("get_table_sizes", {
      max_bytes: DB_MAX_BYTES,
      threshold: THRESHOLD,
    });
    if (error) throw error;
    const over = (sizes ?? []).filter((t: any) => t.over_threshold);
    if (over.length > 0) {
      const lines = over.map((t: any) => {
        const pct = Number(t.pct_of_max ?? 0).toFixed(2);
        return `${t.table_name}: ${pct}% of max (${formatBytes(t.bytes)})`;
      });
      const header = [
        `Database size: ${formatBytes(dbBytes)} (${dbPct.toFixed(2)}% of max)`,
        `Max allowed: ${formatBytes(DB_MAX_BYTES)} (${DB_MAX_BYTES} bytes)`,
        `Threshold: ${(THRESHOLD * 100).toFixed(0)}%`,
        "",
        "Tables over threshold:",
      ].join("\n");
      await sendHighPriorityEmail(
        "Table size threshold exceeded",
        `${header}\n${lines.join("\n")}`
      );
    }

    const tables = await getTables();
    for (const table of tables) {
      await exportTable(table, dateStamp);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    await sendHighPriorityEmail("Backup failed", String(err));
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
