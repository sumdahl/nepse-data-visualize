-- RPC: table sizes and usage percentage
create or replace function public.get_table_sizes(max_bytes bigint, threshold numeric default 0.8)
returns table (
  table_name text,
  bytes bigint,
  pct_of_max numeric,
  over_threshold boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.relname as table_name,
    pg_total_relation_size(c.oid) as bytes,
    round((pg_total_relation_size(c.oid)::numeric / nullif(max_bytes, 0)) * 100, 2) as pct_of_max,
    (pg_total_relation_size(c.oid)::numeric / nullif(max_bytes, 0)) >= threshold as over_threshold
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
  order by bytes desc;
$$;

-- RPC: list public tables (for backup)
create or replace function public.list_public_tables()
returns table (table_name text)
language sql
stable
security definer
set search_path = public
as $$
  select c.relname
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
  order by c.relname;
$$;

-- RPC: database size (total)
create or replace function public.get_database_size()
returns table (db_name text, bytes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select current_database() as db_name, pg_database_size(current_database()) as bytes;
$$;
