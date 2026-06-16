ALTER TABLE public.careers
  ADD COLUMN career_code text,
  ADD COLUMN canonical_name text,
  ADD COLUMN day_to_day_summary text,
  ADD COLUMN personality_fit text,
  ADD COLUMN source_system text NOT NULL DEFAULT 'career-gps-research',
  ADD COLUMN source_reference text,
  ADD COLUMN data_version text NOT NULL DEFAULT '2026.1',
  ADD COLUMN last_reviewed_at date,
  ADD COLUMN is_published boolean NOT NULL DEFAULT true;

WITH ranked AS (
  SELECT id,
    lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) AS slug,
    row_number() OVER (PARTITION BY lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) ORDER BY id) AS n
  FROM public.careers
)
UPDATE public.careers c
SET career_code = CASE WHEN r.n = 1 THEN r.slug ELSE r.slug || '-' || substr(c.id::text, 1, 8) END,
    canonical_name = c.title
FROM ranked r WHERE r.id = c.id;

ALTER TABLE public.careers ALTER COLUMN career_code SET NOT NULL, ALTER COLUMN canonical_name SET NOT NULL;
CREATE UNIQUE INDEX careers_career_code_unique ON public.careers(career_code);
CREATE INDEX careers_published_idx ON public.careers(is_published) WHERE is_published;

CREATE TABLE public.career_taxonomy_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_type text NOT NULL CHECK (term_type IN ('category','technical_skill','soft_skill','interest','school_stream','certification','recruiter','industry')),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  provider text,
  url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (term_type, slug),
  UNIQUE (term_type, name)
);
GRANT SELECT ON public.career_taxonomy_terms TO authenticated;
GRANT ALL ON public.career_taxonomy_terms TO service_role;
ALTER TABLE public.career_taxonomy_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read career taxonomy" ON public.career_taxonomy_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage career taxonomy" ON public.career_taxonomy_terms FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_taxonomy_type_idx ON public.career_taxonomy_terms(term_type, name);

CREATE TABLE public.career_taxonomy_links (
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.career_taxonomy_terms(id) ON DELETE CASCADE,
  relevance smallint NOT NULL DEFAULT 3 CHECK (relevance BETWEEN 1 AND 5),
  requirement_level text CHECK (requirement_level IN ('required','preferred','eligible','recommended','optional','bridge-required')),
  notes text,
  display_order smallint NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  PRIMARY KEY (career_id, term_id)
);
GRANT SELECT ON public.career_taxonomy_links TO authenticated;
GRANT ALL ON public.career_taxonomy_links TO service_role;
ALTER TABLE public.career_taxonomy_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read career taxonomy links" ON public.career_taxonomy_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage career taxonomy links" ON public.career_taxonomy_links FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_taxonomy_links_term_idx ON public.career_taxonomy_links(term_id, career_id);

CREATE TABLE public.career_responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  responsibility text NOT NULL,
  display_order smallint NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  UNIQUE (career_id, responsibility)
);
GRANT SELECT ON public.career_responsibilities TO authenticated;
GRANT ALL ON public.career_responsibilities TO service_role;
ALTER TABLE public.career_responsibilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read responsibilities" ON public.career_responsibilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage responsibilities" ON public.career_responsibilities FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_responsibilities_order_idx ON public.career_responsibilities(career_id, display_order);

CREATE TABLE public.career_degree_links (
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  degree_id uuid NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  requirement_level text NOT NULL DEFAULT 'eligible' CHECK (requirement_level IN ('required','preferred','eligible','alternative')),
  notes text,
  PRIMARY KEY (career_id, degree_id)
);
GRANT SELECT ON public.career_degree_links TO authenticated;
GRANT ALL ON public.career_degree_links TO service_role;
ALTER TABLE public.career_degree_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read eligible degrees" ON public.career_degree_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage eligible degrees" ON public.career_degree_links FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_degree_links_degree_idx ON public.career_degree_links(degree_id);

CREATE TABLE public.career_salary_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  market_code text NOT NULL,
  market_name text NOT NULL,
  career_stage text NOT NULL CHECK (career_stage IN ('entry','mid','senior')),
  annual_min numeric(14,2) NOT NULL CHECK (annual_min >= 0),
  annual_median numeric(14,2) NOT NULL CHECK (annual_median >= annual_min),
  annual_max numeric(14,2) NOT NULL CHECK (annual_max >= annual_median),
  currency_code char(3) NOT NULL,
  salary_unit text NOT NULL DEFAULT 'annual',
  as_of_year smallint NOT NULL CHECK (as_of_year BETWEEN 2000 AND 2100),
  source_name text NOT NULL,
  source_url text,
  confidence smallint NOT NULL DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  UNIQUE (career_id, market_code, career_stage, as_of_year, source_name)
);
GRANT SELECT ON public.career_salary_benchmarks TO authenticated;
GRANT ALL ON public.career_salary_benchmarks TO service_role;
ALTER TABLE public.career_salary_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read salary benchmarks" ON public.career_salary_benchmarks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage salary benchmarks" ON public.career_salary_benchmarks FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_salary_lookup_idx ON public.career_salary_benchmarks(career_id, market_code, career_stage);

CREATE TABLE public.career_outlook_scores (
  career_id uuid PRIMARY KEY REFERENCES public.careers(id) ON DELETE CASCADE,
  ai_disruption_risk smallint NOT NULL CHECK (ai_disruption_risk BETWEEN 0 AND 100),
  future_demand_score smallint NOT NULL CHECK (future_demand_score BETWEEN 0 AND 100),
  work_life_balance_score smallint NOT NULL CHECK (work_life_balance_score BETWEEN 0 AND 100),
  remote_work_potential smallint NOT NULL CHECK (remote_work_potential BETWEEN 0 AND 100),
  entrepreneurship_potential smallint NOT NULL CHECK (entrepreneurship_potential BETWEEN 0 AND 100),
  methodology_version text NOT NULL,
  rationale text,
  source_names text[] NOT NULL DEFAULT '{}',
  assessed_at date NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.career_outlook_scores TO authenticated;
GRANT ALL ON public.career_outlook_scores TO service_role;
ALTER TABLE public.career_outlook_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read outlook scores" ON public.career_outlook_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage outlook scores" ON public.career_outlook_scores FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_outlook_demand_idx ON public.career_outlook_scores(future_demand_score DESC);
CREATE INDEX career_outlook_ai_idx ON public.career_outlook_scores(ai_disruption_risk);

CREATE TABLE public.career_relations (
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  related_career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  relation_type text NOT NULL DEFAULT 'related' CHECK (relation_type IN ('related','adjacent','progression','alternative')),
  similarity_score smallint CHECK (similarity_score BETWEEN 0 AND 100),
  PRIMARY KEY (career_id, related_career_id, relation_type),
  CHECK (career_id <> related_career_id)
);
GRANT SELECT ON public.career_relations TO authenticated;
GRANT ALL ON public.career_relations TO service_role;
ALTER TABLE public.career_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read related careers" ON public.career_relations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage related careers" ON public.career_relations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_relations_reverse_idx ON public.career_relations(related_career_id);

CREATE TABLE public.career_learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id uuid NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  title text NOT NULL,
  provider text,
  resource_type text NOT NULL CHECK (resource_type IN ('course','book','documentation','community','project','video','article')),
  url text NOT NULL,
  language_code text NOT NULL DEFAULT 'en',
  is_free boolean,
  display_order smallint NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  UNIQUE (career_id, url)
);
GRANT SELECT ON public.career_learning_resources TO authenticated;
GRANT ALL ON public.career_learning_resources TO service_role;
ALTER TABLE public.career_learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read learning resources" ON public.career_learning_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage learning resources" ON public.career_learning_resources FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX career_learning_resources_order_idx ON public.career_learning_resources(career_id, display_order);

CREATE TRIGGER career_taxonomy_terms_updated_at BEFORE UPDATE ON public.career_taxonomy_terms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER career_outlook_scores_updated_at BEFORE UPDATE ON public.career_outlook_scores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.export_career_catalog(_career_code text DEFAULT NULL)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(record ORDER BY record->>'career_name'), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'career_id', c.id,
      'career_code', c.career_code,
      'career_name', c.canonical_name,
      'category', COALESCE((SELECT to_jsonb(t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='category' ORDER BY l.relevance DESC LIMIT 1), to_jsonb(c.category)),
      'description', c.description,
      'day_to_day_summary', c.day_to_day_summary,
      'responsibilities', COALESCE((SELECT jsonb_agg(r.responsibility ORDER BY r.display_order) FROM public.career_responsibilities r WHERE r.career_id=c.id), '[]'::jsonb),
      'required_skills', COALESCE((SELECT jsonb_agg(jsonb_build_object('name',t.name,'importance',l.relevance) ORDER BY l.relevance DESC,t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='technical_skill'), to_jsonb(COALESCE(c.skills_required,'{}'::text[]))),
      'soft_skills', COALESCE((SELECT jsonb_agg(jsonb_build_object('name',t.name,'importance',l.relevance) ORDER BY l.relevance DESC,t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='soft_skill'), '[]'::jsonb),
      'personality_fit', c.personality_fit,
      'suitable_interests', COALESCE((SELECT jsonb_agg(t.name ORDER BY l.relevance DESC,t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='interest'), '[]'::jsonb),
      'suitable_school_streams', COALESCE((SELECT jsonb_agg(jsonb_build_object('name',t.name,'eligibility',l.requirement_level,'notes',l.notes) ORDER BY l.relevance DESC,t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='school_stream'), '[]'::jsonb),
      'eligible_degrees', COALESCE((SELECT jsonb_agg(jsonb_build_object('degree_id',d.id,'name',d.name,'level',d.level,'requirement',l.requirement_level,'notes',l.notes) ORDER BY d.name) FROM public.career_degree_links l JOIN public.degrees d ON d.id=l.degree_id WHERE l.career_id=c.id), to_jsonb(COALESCE(c.degrees_accepted,'{}'::text[]))),
      'certifications', COALESCE((SELECT jsonb_agg(jsonb_build_object('name',t.name,'provider',t.provider,'url',t.url,'relevance',l.requirement_level) ORDER BY t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='certification'), to_jsonb(COALESCE(c.certifications,'{}'::text[]))),
      'salary_benchmarks', COALESCE((SELECT jsonb_agg(jsonb_build_object('market_code',s.market_code,'market_name',s.market_name,'career_stage',s.career_stage,'annual_min',s.annual_min,'annual_median',s.annual_median,'annual_max',s.annual_max,'currency',s.currency_code,'as_of_year',s.as_of_year,'source',s.source_name,'source_url',s.source_url,'confidence',s.confidence) ORDER BY s.market_code,s.career_stage) FROM public.career_salary_benchmarks s WHERE s.career_id=c.id), jsonb_build_array(jsonb_build_object('market_code','IN','market_name','India','career_stage','entry','annual_median_lpa',c.salary_entry),jsonb_build_object('market_code','IN','market_name','India','career_stage','mid','annual_median_lpa',c.salary_mid),jsonb_build_object('market_code','IN','market_name','India','career_stage','senior','annual_median_lpa',c.salary_senior))),
      'outlook', COALESCE((SELECT jsonb_build_object('ai_disruption_risk',o.ai_disruption_risk,'future_demand_score',o.future_demand_score,'work_life_balance_score',o.work_life_balance_score,'remote_work_potential',o.remote_work_potential,'entrepreneurship_potential',o.entrepreneurship_potential,'methodology_version',o.methodology_version,'rationale',o.rationale,'sources',o.source_names,'assessed_at',o.assessed_at) FROM public.career_outlook_scores o WHERE o.career_id=c.id), jsonb_build_object('ai_disruption_risk_label',c.ai_risk,'future_demand_score',c.demand_index,'remote_work_label',c.remote_opportunities)),
      'top_recruiters', COALESCE((SELECT jsonb_agg(t.name ORDER BY l.relevance DESC,t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='recruiter'), to_jsonb(COALESCE(c.top_companies,'{}'::text[]))),
      'top_industries', COALESCE((SELECT jsonb_agg(t.name ORDER BY l.relevance DESC,t.name) FROM public.career_taxonomy_links l JOIN public.career_taxonomy_terms t ON t.id=l.term_id WHERE l.career_id=c.id AND t.term_type='industry'), '[]'::jsonb),
      'related_careers', COALESCE((SELECT jsonb_agg(jsonb_build_object('career_id',rc.id,'career_code',rc.career_code,'career_name',rc.canonical_name,'relation_type',rel.relation_type,'similarity_score',rel.similarity_score) ORDER BY rel.similarity_score DESC NULLS LAST,rc.canonical_name) FROM public.career_relations rel JOIN public.careers rc ON rc.id=rel.related_career_id WHERE rel.career_id=c.id), to_jsonb(COALESCE(c.alternatives,'{}'::text[]))),
      'learning_resources', COALESCE((SELECT jsonb_agg(jsonb_build_object('title',lr.title,'provider',lr.provider,'type',lr.resource_type,'url',lr.url,'language',lr.language_code,'is_free',lr.is_free) ORDER BY lr.display_order,lr.title) FROM public.career_learning_resources lr WHERE lr.career_id=c.id), '[]'::jsonb),
      'provenance', jsonb_build_object('source_system',c.source_system,'source_reference',c.source_reference,'data_version',c.data_version,'last_reviewed_at',c.last_reviewed_at)
    ) AS record
    FROM public.careers c
    WHERE c.is_published AND (_career_code IS NULL OR c.career_code=_career_code)
  ) exported;
$$;
GRANT EXECUTE ON FUNCTION public.export_career_catalog(text) TO authenticated, service_role;