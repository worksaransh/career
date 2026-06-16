ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS salary_senior numeric,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS skills_required text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS degrees_accepted text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS future_demand text,
  ADD COLUMN IF NOT EXISTS growth_rate numeric,
  ADD COLUMN IF NOT EXISTS top_companies text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS remote_opportunities text;

CREATE UNIQUE INDEX IF NOT EXISTS careers_title_unique ON public.careers (title);
CREATE INDEX IF NOT EXISTS careers_category_idx ON public.careers (category);
CREATE INDEX IF NOT EXISTS careers_future_demand_idx ON public.careers (future_demand);

GRANT SELECT ON public.careers TO anon;