# Future Ready Desh — Full Bundle

Contents:
- source/             Complete TanStack Start app source
- database/migrations Supabase SQL migrations (canonical schema)
- database/csv        Per-table CSV exports (data snapshot)
- datasets/           Curated JSON exports (if present)

## Restore locally (closest to a SQL dump)
1) Spin up a local Supabase project: `supabase init && supabase start`
2) Drop migrations into supabase/migrations and run: `supabase db reset`
3) Load data with psql COPY for each CSV:
   psql "$LOCAL_DB_URL" -c "\copy public.<table> FROM 'database/csv/<table>.csv' WITH CSV HEADER"
