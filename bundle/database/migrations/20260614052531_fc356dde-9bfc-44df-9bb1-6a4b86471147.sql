ALTER TABLE public.degrees
  ADD COLUMN degree_code text,
  ADD COLUMN canonical_name text,
  ADD COLUMN eligibility_summary text,
  ADD COLUMN fee_min_inr numeric(14,2),
  ADD COLUMN fee_max_inr numeric(14,2),
  ADD COLUMN source_system text NOT NULL DEFAULT 'education-catalog',
  ADD COLUMN source_reference text,
  ADD COLUMN data_version text NOT NULL DEFAULT '2026.1',
  ADD COLUMN last_reviewed_at date,
  ADD COLUMN is_published boolean NOT NULL DEFAULT true;

WITH ranked AS (
  SELECT id,
    lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) AS slug,
    row_number() OVER (PARTITION BY lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) ORDER BY id) AS n
  FROM public.degrees
)
UPDATE public.degrees d
SET degree_code = CASE WHEN r.n = 1 THEN r.slug ELSE r.slug || '-' || substr(d.id::text, 1, 8) END,
    canonical_name = d.name,
    fee_min_inr = COALESCE(d.avg_fees, 0),
    fee_max_inr = COALESCE(d.avg_fees, 0)
FROM ranked r WHERE r.id = d.id;

ALTER TABLE public.degrees
  ALTER COLUMN degree_code SET NOT NULL,
  ALTER COLUMN canonical_name SET NOT NULL;
CREATE UNIQUE INDEX degrees_degree_code_unique ON public.degrees(degree_code);
CREATE INDEX degrees_level_stream_idx ON public.degrees(level, stream);
CREATE INDEX degrees_published_idx ON public.degrees(is_published) WHERE is_published;

ALTER TABLE public.colleges
  ADD COLUMN college_code text,
  ADD COLUMN canonical_name text,
  ADD COLUMN country_code char(2) NOT NULL DEFAULT 'IN',
  ADD COLUMN postal_code text,
  ADD COLUMN source_system text NOT NULL DEFAULT 'education-catalog',
  ADD COLUMN source_reference text,
  ADD COLUMN data_version text NOT NULL DEFAULT '2026.1',
  ADD COLUMN last_reviewed_at date,
  ADD COLUMN is_published boolean NOT NULL DEFAULT true;

WITH ranked AS (
  SELECT id,
    lower(regexp_replace(regexp_replace(name || '-' || COALESCE(city, ''), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) AS slug,
    row_number() OVER (PARTITION BY lower(regexp_replace(regexp_replace(name || '-' || COALESCE(city, ''), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) ORDER BY id) AS n
  FROM public.colleges
)
UPDATE public.colleges c
SET college_code = CASE WHEN r.n = 1 THEN r.slug ELSE r.slug || '-' || substr(c.id::text, 1, 8) END,
    canonical_name = c.name
FROM ranked r WHERE r.id = c.id;

ALTER TABLE public.colleges
  ALTER COLUMN college_code SET NOT NULL,
  ALTER COLUMN canonical_name SET NOT NULL;
CREATE UNIQUE INDEX colleges_college_code_unique ON public.colleges(college_code);
CREATE INDEX colleges_location_idx ON public.colleges(country_code, state, city);
CREATE INDEX colleges_published_idx ON public.colleges(is_published) WHERE is_published;

CREATE TABLE public.degree_outlook_metrics (
  degree_id uuid PRIMARY KEY REFERENCES public.degrees(id) ON DELETE CASCADE,
  roi_score smallint NOT NULL CHECK (roi_score BETWEEN 0 AND 100),
  estimated_payback_months smallint CHECK (estimated_payback_months BETWEEN 0 AND 600),
  demand_score smallint NOT NULL CHECK (demand_score BETWEEN 0 AND 100),
  future_outlook_score smallint NOT NULL CHECK (future_outlook_score BETWEEN 0 AND 100),
  ai_disruption_risk smallint NOT NULL CHECK (ai_disruption_risk BETWEEN 0 AND 100),
  methodology_version text NOT NULL,
  rationale text,
  source_names text[] NOT NULL DEFAULT '{}',
  assessed_at date NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.degree_outlook_metrics TO authenticated;
GRANT ALL ON public.degree_outlook_metrics TO service_role;
ALTER TABLE public.degree_outlook_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read degree outlook" ON public.degree_outlook_metrics FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.degrees d WHERE d.id = degree_id AND d.is_published));
CREATE POLICY "Admins manage degree outlook" ON public.degree_outlook_metrics FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX degree_outlook_demand_idx ON public.degree_outlook_metrics(demand_score DESC);

CREATE TABLE public.education_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_code text NOT NULL UNIQUE,
  name text NOT NULL,
  provider text,
  website text,
  description text,
  validity_months smallint CHECK (validity_months > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.education_certifications TO authenticated;
GRANT ALL ON public.education_certifications TO service_role;
ALTER TABLE public.education_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read certifications" ON public.education_certifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage certifications" ON public.education_certifications FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.degree_certification_links (
  degree_id uuid NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  certification_id uuid NOT NULL REFERENCES public.education_certifications(id) ON DELETE CASCADE,
  relevance smallint NOT NULL DEFAULT 3 CHECK (relevance BETWEEN 1 AND 5),
  recommendation_level text NOT NULL DEFAULT 'recommended' CHECK (recommendation_level IN ('required','preferred','recommended','optional')),
  notes text,
  PRIMARY KEY (degree_id, certification_id)
);
GRANT SELECT ON public.degree_certification_links TO authenticated;
GRANT ALL ON public.degree_certification_links TO service_role;
ALTER TABLE public.degree_certification_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read degree certifications" ON public.degree_certification_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage degree certifications" ON public.degree_certification_links FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX degree_certifications_cert_idx ON public.degree_certification_links(certification_id);

CREATE TABLE public.college_degree_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  degree_id uuid NOT NULL REFERENCES public.degrees(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  study_mode text NOT NULL DEFAULT 'full-time' CHECK (study_mode IN ('full-time','part-time','distance','online','hybrid')),
  duration_years numeric(4,1) CHECK (duration_years > 0 AND duration_years <= 15),
  annual_fee_inr numeric(14,2) CHECK (annual_fee_inr >= 0),
  total_fee_inr numeric(14,2) CHECK (total_fee_inr >= 0),
  seats integer CHECK (seats >= 0),
  entrance_exams text[] NOT NULL DEFAULT '{}',
  eligibility_notes text,
  application_url text,
  is_active boolean NOT NULL DEFAULT true,
  source_reference text,
  last_reviewed_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, degree_id, course_name, study_mode)
);
GRANT SELECT ON public.college_degree_offerings TO authenticated;
GRANT ALL ON public.college_degree_offerings TO service_role;
ALTER TABLE public.college_degree_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read active college courses" ON public.college_degree_offerings FOR SELECT TO authenticated USING (is_active);
CREATE POLICY "Admins manage college courses" ON public.college_degree_offerings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX college_offerings_college_idx ON public.college_degree_offerings(college_id, is_active);
CREATE INDEX college_offerings_degree_idx ON public.college_degree_offerings(degree_id, is_active);

CREATE TABLE public.college_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  ranking_body text NOT NULL,
  ranking_category text NOT NULL DEFAULT 'overall',
  ranking_year smallint NOT NULL CHECK (ranking_year BETWEEN 2000 AND 2100),
  rank integer CHECK (rank > 0),
  score numeric(7,3) CHECK (score >= 0),
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, ranking_body, ranking_category, ranking_year)
);
GRANT SELECT ON public.college_rankings TO authenticated;
GRANT ALL ON public.college_rankings TO service_role;
ALTER TABLE public.college_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read college rankings" ON public.college_rankings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage college rankings" ON public.college_rankings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX college_rankings_lookup_idx ON public.college_rankings(ranking_year DESC, ranking_body, rank);

CREATE TABLE public.college_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  degree_id uuid REFERENCES public.degrees(id) ON DELETE SET NULL,
  placement_year smallint NOT NULL CHECK (placement_year BETWEEN 2000 AND 2100),
  placement_rate numeric(5,2) CHECK (placement_rate BETWEEN 0 AND 100),
  average_package_inr numeric(14,2) CHECK (average_package_inr >= 0),
  median_package_inr numeric(14,2) CHECK (median_package_inr >= 0),
  highest_package_inr numeric(14,2) CHECK (highest_package_inr >= 0),
  students_placed integer CHECK (students_placed >= 0),
  top_recruiters text[] NOT NULL DEFAULT '{}',
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (college_id, degree_id, placement_year)
);
GRANT SELECT ON public.college_placements TO authenticated;
GRANT ALL ON public.college_placements TO service_role;
ALTER TABLE public.college_placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read college placements" ON public.college_placements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage college placements" ON public.college_placements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX college_placements_lookup_idx ON public.college_placements(college_id, placement_year DESC);

CREATE TABLE public.college_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  scholarship_code text NOT NULL,
  name text NOT NULL,
  eligibility text NOT NULL,
  award_type text NOT NULL CHECK (award_type IN ('fixed','percentage','fee-waiver','stipend','other')),
  award_value numeric(14,2) CHECK (award_value >= 0),
  currency_code char(3) NOT NULL DEFAULT 'INR',
  application_url text,
  deadline date,
  is_active boolean NOT NULL DEFAULT true,
  source_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, scholarship_code)
);
GRANT SELECT ON public.college_scholarships TO authenticated;
GRANT ALL ON public.college_scholarships TO service_role;
ALTER TABLE public.college_scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read active scholarships" ON public.college_scholarships FOR SELECT TO authenticated USING (is_active);
CREATE POLICY "Admins manage scholarships" ON public.college_scholarships FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX college_scholarships_college_idx ON public.college_scholarships(college_id, is_active);

CREATE TABLE public.college_accreditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  accreditation_body text NOT NULL,
  accreditation_name text NOT NULL,
  grade text,
  valid_from date,
  valid_until date,
  credential_url text,
  source_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (college_id, accreditation_body, accreditation_name, valid_from)
);
GRANT SELECT ON public.college_accreditations TO authenticated;
GRANT ALL ON public.college_accreditations TO service_role;
ALTER TABLE public.college_accreditations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read accreditations" ON public.college_accreditations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage accreditations" ON public.college_accreditations FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX college_accreditations_college_idx ON public.college_accreditations(college_id);

CREATE TRIGGER degree_outlook_updated_at BEFORE UPDATE ON public.degree_outlook_metrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER education_certifications_updated_at BEFORE UPDATE ON public.education_certifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER college_offerings_updated_at BEFORE UPDATE ON public.college_degree_offerings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER college_scholarships_updated_at BEFORE UPDATE ON public.college_scholarships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();