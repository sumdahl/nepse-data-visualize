# Supabase Monitoring & Backups

This document describes the automated database monitoring, email alerts, and CSV backups implemented for this project.

## Overview

The Edge Function does the following:
- Measures database and table sizes via RPC.
- Sends a high-priority email if any table exceeds the configured threshold.
- Exports each table as a CSV file.
- Uploads CSVs to a private Supabase Storage bucket named `backups`.

## Files

- `supabase/sql/db-monitor-backup.sql`
- `supabase/functions/db-monitor-backup/index.ts`

## SQL Setup

Run this file in Supabase SQL Editor:

- `supabase/sql/db-monitor-backup.sql`

It creates these RPC functions:
- `get_table_sizes(max_bytes, threshold)`
- `list_public_tables()`
- `get_database_size()`

## Storage Bucket

Create a private Storage bucket named `backups`.

## Resend Email

You must have a verified sender domain in Resend. Example:

- `ALERT_EMAIL_FROM="Alerts <alerts@sumirandahal.com.np>"`
- `ALERT_EMAIL_TO="sumirandahal46@gmail.com"`

## Edge Function Secrets

Set these secrets in Supabase (Edge Functions):

```bash
supabase secrets set \
  DB_MAX_BYTES=524288000 \
  DB_THRESHOLD=0.8 \
  BACKUP_BUCKET=backups \
  RESEND_API_KEY=your_resend_key \
  ALERT_EMAIL_TO=sumirandahal46@gmail.com \
  ALERT_EMAIL_FROM="Alerts <alerts@sumirandahal.com.np>"
```

Notes:
- `DB_MAX_BYTES=524288000` = 500 MiB (Supabase Free plan limit).
- `DB_THRESHOLD=0.8` = 80% threshold.

## Deploy the Function

```bash
supabase login
supabase link --project-ref odyugfnavoewgwnrkach
supabase functions deploy db-monitor-backup
```

## Manual Test

```bash
curl -i \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://odyugfnavoewgwnrkach.supabase.co/functions/v1/db-monitor-backup
```

Expected:
- `200 OK`
- CSV files in `backups`
- Email if threshold exceeded

## Force a Test Email

```bash
supabase secrets set DB_THRESHOLD=0.000001
```
Then call the function again. Reset after test:

```bash
supabase secrets set DB_THRESHOLD=0.8
```

## Schedule Daily Run (2 AM)

Run in Supabase SQL Editor:

```sql
select vault.create_secret('https://odyugfnavoewgwnrkach.supabase.co', 'project_url');
select vault.create_secret('YOUR_SUPABASE_ANON_KEY', 'anon_key');

select
  cron.schedule(
    'db-monitor-backup',
    '0 2 * * *',
    $$
    select
      net.http_post(
        url:= (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
              || '/functions/v1/db-monitor-backup',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
        ),
        body:=jsonb_build_object('time', now())
      );
    $$
  );
```

## Verify

- Supabase Dashboard → Edge Functions → Logs
- Supabase Storage → `backups`
- Email inbox
