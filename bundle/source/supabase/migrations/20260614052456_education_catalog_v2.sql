-- =============================================================
--  EDUCATION CATALOG v2  –  Normalized schema
--  Covers: degrees, colleges, degree-career links,
--          college-course offerings, scholarships,
--          accreditations, placements, rankings,
--          source provenance
--  Target: India-focused, 300+ degrees, 5 000+ colleges
--  All seeded rows are SYNTHETIC / REFERENCE DATA unless
--  explicitly marked as verified (verified_at IS NOT NULL)
-- =============================================================

-- ─── ENUMS ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE edu_level AS ENUM (
    'class_10','class_12','diploma','certificate',
    'undergrad','integrated','postgrad','doctorate','fellowship'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE college_type AS ENUM (
    'central_university','state_university','deemed_university',
    'iit','nit','iim','iiit','aiims','iiser',
    'private_university','autonomous_college','government_college',
    'private_college','open_university','distance_learning'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE accreditation_status AS ENUM (
    'active','expired','pending','suspended','not_applied'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ranking_agency AS ENUM (
    'nirf','qs_world','qs_asia','the_world','times_india',
    'outlook','india_today','week','careers360','other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE scholarship_scope AS ENUM (
    'national','state','institution','corporate','international'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE data_source AS ENUM (
    'nirf_portal','ugc_portal','aicte_portal','naac_portal',
    'nba_portal','bar_council','mci','nci','manual_admin',
    'web_scrape','synthetic'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── 1. SOURCE PROVENANCE ─────────────────────────────────────
-- Every catalog row can point to one or more provenance records
CREATE TABLE IF NOT EXISTS public.source_provenance (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source        data_source NOT NULL,
  source_url    text,
  source_ref_id text,                    -- row/reg number at source
  fetched_at    timestamptz,
  verified_at   timestamptz,             -- NULL = synthetic/unverified
  verified_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes         text,
  raw_payload   jsonb,                   -- original scraped/imported blob
  created_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.source_provenance TO authenticated;
GRANT ALL    ON public.source_provenance TO service_role;
ALTER TABLE public.source_provenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads provenance"  ON public.source_provenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage provenance" ON public.source_provenance
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX sp_source_idx ON public.source_provenance(source, fetched_at DESC);

-- ─── 2. DEGREE FIELDS (taxonomy) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.degree_fields (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text  NOT NULL UNIQUE,  -- e.g. "Computer Science & Engineering"
  parent_id   uuid  REFERENCES public.degree_fields(id) ON DELETE SET NULL,
  stream      text,                   -- Science | Commerce | Arts | Vocational
  created_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.degree_fields TO authenticated;
GRANT ALL    ON public.degree_fields TO service_role;
ALTER TABLE public.degree_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads fields" ON public.degree_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage fields" ON public.degree_fields
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ─── 3. DEGREES (expanded) ───────────────────────────────────
-- The existing public.degrees table is kept for backward compat.
-- This new table is the normalized source of truth.
CREATE TABLE IF NOT EXISTS public.degrees_v2 (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identity
  name                text        NOT NULL,           -- "Bachelor of Technology"
  short_name          text,                           -- "B.Tech"
  abbreviation        text,                           -- "B.Tech (CSE)"
  level               edu_level   NOT NULL DEFAULT 'undergrad',
  -- Classification
  field_id            uuid        REFERENCES public.degree_fields(id) ON DELETE SET NULL,
  specialisation      text,                           -- "Computer Science & Engineering"
  stream              text,                           -- Science | Commerce | Arts | Vocational
  mode                text        DEFAULT 'full_time'
                      CHECK (mode IN ('full_time','part_time','distance','online','sandwich')),
  -- Duration
  duration_years      numeric(4,1) NOT NULL DEFAULT 3,
  semesters           int          GENERATED ALWAYS AS (ROUND(duration_years * 2)::int) STORED,
  -- Eligibility
  eligibility_min_pct numeric(5,2),
  eligibility_stream  text[],                          -- ['Science','Commerce']
  entrance_exams      text[],                          -- ['JEE Main','NEET','CAT']
  -- Fees (INR, approximate, synthetic unless verified)
  avg_fees_total      numeric(12,2),
  min_fees_total      numeric(12,2),
  max_fees_total      numeric(12,2),
  -- Market signals (synthetic / AI-estimated unless verified)
  avg_starting_salary numeric(10,2),
  demand_index        int          DEFAULT 50 CHECK (demand_index BETWEEN 0 AND 100),
  -- Tags & search
  career_tags         text[]       DEFAULT '{}',
  skill_tags          text[]       DEFAULT '{}',
  keywords            tsvector     GENERATED ALWAYS AS (
                        to_tsvector('english', coalesce(name,'') || ' ' ||
                        coalesce(short_name,'') || ' ' || coalesce(specialisation,''))
                      ) STORED,
  -- Description
  description         text,
  curriculum_summary  jsonb,                           -- [{semester:1, subjects:[...]}]
  -- Meta
  is_active           boolean      NOT NULL DEFAULT true,
  provenance_id       uuid         REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at          timestamptz  NOT NULL DEFAULT now(),
  updated_at          timestamptz  NOT NULL DEFAULT now(),
  -- Dedup key
  UNIQUE (name, specialisation, mode, level)
);
GRANT SELECT ON public.degrees_v2 TO authenticated;
GRANT ALL    ON public.degrees_v2 TO service_role;
ALTER TABLE public.degrees_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads degrees_v2"    ON public.degrees_v2 FOR SELECT TO authenticated USING (is_active);
CREATE POLICY "anon reads degrees_v2"    ON public.degrees_v2 FOR SELECT TO anon          USING (is_active);
CREATE POLICY "admins manage degrees_v2" ON public.degrees_v2
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX degrees_v2_level_idx     ON public.degrees_v2(level);
CREATE INDEX degrees_v2_stream_idx    ON public.degrees_v2(stream);
CREATE INDEX degrees_v2_field_idx     ON public.degrees_v2(field_id);
CREATE INDEX degrees_v2_keywords_idx  ON public.degrees_v2 USING gin(keywords);
CREATE INDEX degrees_v2_career_tags   ON public.degrees_v2 USING gin(career_tags);
CREATE TRIGGER degrees_v2_updated BEFORE UPDATE ON public.degrees_v2
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 4. DEGREE ↔ CAREER LINKS ────────────────────────────────
-- Many-to-many with link quality attributes
CREATE TABLE IF NOT EXISTS public.degree_career_links (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  degree_id       uuid    NOT NULL REFERENCES public.degrees_v2(id)  ON DELETE CASCADE,
  career_id       uuid    NOT NULL REFERENCES public.careers(id)      ON DELETE CASCADE,
  -- Relationship strength
  relevance       int     NOT NULL DEFAULT 50 CHECK (relevance BETWEEN 0 AND 100),
                          -- 80-100 = primary pathway, 50-79 = common, <50 = possible
  pathway_type    text    DEFAULT 'direct'
                  CHECK (pathway_type IN ('direct','with_pg','with_certification','lateral','entrepreneurship')),
  typical_roles   text[]  DEFAULT '{}',    -- ["Software Engineer","SDE-2"]
  median_years_to_role int DEFAULT 0,      -- years after degree before entering role
  is_primary      boolean NOT NULL DEFAULT false,
  notes           text,
  provenance_id   uuid    REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (degree_id, career_id, pathway_type)
);
GRANT SELECT ON public.degree_career_links TO authenticated;
GRANT ALL    ON public.degree_career_links TO service_role;
ALTER TABLE public.degree_career_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads dcl"    ON public.degree_career_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage dcl" ON public.degree_career_links
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX dcl_degree_idx  ON public.degree_career_links(degree_id, relevance DESC);
CREATE INDEX dcl_career_idx  ON public.degree_career_links(career_id, relevance DESC);

-- ─── 5. COLLEGES (expanded) ──────────────────────────────────
-- Extends existing public.colleges for backward compat.
CREATE TABLE IF NOT EXISTS public.colleges_v2 (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identity
  name              text          NOT NULL,
  short_name        text,                              -- "IIT-B"
  slug              text          UNIQUE,              -- "iit-bombay" for URLs
  type              college_type  NOT NULL DEFAULT 'private_college',
  -- Location
  city              text,
  district          text,
  state             text,
  state_code        char(2),                           -- ISO 3166-2 subdivision (MH, DL …)
  pincode           char(6),
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  -- Contact & web
  website           text,
  email             text,
  phone             text,
  -- Regulatory IDs
  ugc_id            text,                              -- UGC recognised institution code
  aicte_id          text,                              -- AICTE approval code
  naac_grade        text,                              -- A++, A+, A, B++, B+, B, C
  naac_cgpa         numeric(4,2),
  naac_cycle        int,                               -- NAAC cycle number
  -- Size
  total_seats       int,
  pg_seats          int,
  phd_seats         int,
  faculty_count     int,
  campus_area_acres numeric(8,2),
  -- Fees (INR approximate, synthetic unless verified)
  avg_fees_ug       numeric(12,2),
  avg_fees_pg       numeric(12,2),
  -- Facilities (boolean flags)
  has_hostel        boolean DEFAULT false,
  has_girls_hostel  boolean DEFAULT false,
  has_sports        boolean DEFAULT false,
  has_research_park boolean DEFAULT false,
  -- Description & media
  description       text,
  logo_url          text,
  banner_url        text,
  established_year  int,
  -- Search
  keywords          tsvector GENERATED ALWAYS AS (
                      to_tsvector('english',
                        coalesce(name,'') || ' ' ||
                        coalesce(short_name,'') || ' ' ||
                        coalesce(city,'') || ' ' ||
                        coalesce(state,''))
                    ) STORED,
  -- Meta
  is_active         boolean     NOT NULL DEFAULT true,
  provenance_id     uuid        REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  legacy_id         uuid        REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  -- Dedup key: name+city+state must be unique
  UNIQUE (name, city, state)
);
GRANT SELECT ON public.colleges_v2 TO authenticated;
GRANT ALL    ON public.colleges_v2 TO service_role;
ALTER TABLE public.colleges_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads colleges_v2"    ON public.colleges_v2 FOR SELECT TO authenticated USING (is_active);
CREATE POLICY "anon reads colleges_v2"    ON public.colleges_v2 FOR SELECT TO anon          USING (is_active);
CREATE POLICY "admins manage colleges_v2" ON public.colleges_v2
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX colleges_v2_state_idx    ON public.colleges_v2(state, type);
CREATE INDEX colleges_v2_type_idx     ON public.colleges_v2(type);
CREATE INDEX colleges_v2_keywords_idx ON public.colleges_v2 USING gin(keywords);
CREATE TRIGGER colleges_v2_updated BEFORE UPDATE ON public.colleges_v2
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 6. COLLEGE-COURSE OFFERINGS ─────────────────────────────
-- Which degrees a college offers, with course-level details
CREATE TABLE IF NOT EXISTS public.college_course_offerings (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id          uuid    NOT NULL REFERENCES public.colleges_v2(id) ON DELETE CASCADE,
  degree_id           uuid    NOT NULL REFERENCES public.degrees_v2(id)  ON DELETE CASCADE,
  -- Course metadata
  course_name         text,                  -- override if college uses custom name
  department          text,
  intake_seats        int,
  intake_year         int    DEFAULT EXTRACT(year FROM now())::int,
  cutoff_percentile   numeric(5,2),          -- last year general category cutoff
  cutoff_rank         int,                   -- for JEE/NEET based admissions
  -- Fees (this specific college, INR, synthetic unless verified)
  fee_total           numeric(12,2),
  fee_per_semester    numeric(10,2),
  fee_hostel_annual   numeric(10,2),
  -- Admission
  admission_mode      text    DEFAULT 'entrance'
                      CHECK (admission_mode IN ('entrance','merit','management','lateral','sponsored')),
  entrance_exams      text[]  DEFAULT '{}',
  -- Status
  is_active           boolean NOT NULL DEFAULT true,
  approval_body       text,                  -- UGC / AICTE / BCI / MCI / NCI ...
  approval_year       int,
  -- Provenance
  provenance_id       uuid    REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, degree_id, intake_year)
);
GRANT SELECT ON public.college_course_offerings TO authenticated;
GRANT ALL    ON public.college_course_offerings TO service_role;
ALTER TABLE public.college_course_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads cco"    ON public.college_course_offerings FOR SELECT TO authenticated USING (is_active);
CREATE POLICY "admins manage cco" ON public.college_course_offerings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX cco_college_idx ON public.college_course_offerings(college_id);
CREATE INDEX cco_degree_idx  ON public.college_course_offerings(degree_id);
CREATE TRIGGER cco_updated BEFORE UPDATE ON public.college_course_offerings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 7. ACCREDITATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accreditations (
  id              uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id      uuid                  NOT NULL REFERENCES public.colleges_v2(id) ON DELETE CASCADE,
  body            text                  NOT NULL,   -- "NAAC","NBA","ABET","AACSB","EQUIS"
  grade           text,                             -- "A++","Grade A","Accredited"
  score           numeric(5,2),
  valid_from      date,
  valid_until     date,
  status          accreditation_status  NOT NULL DEFAULT 'active',
  certificate_url text,
  provenance_id   uuid                  REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at      timestamptz           NOT NULL DEFAULT now(),
  updated_at      timestamptz           NOT NULL DEFAULT now(),
  UNIQUE (college_id, body, valid_from)
);
GRANT SELECT ON public.accreditations TO authenticated;
GRANT ALL    ON public.accreditations TO service_role;
ALTER TABLE public.accreditations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads accreditations"    ON public.accreditations FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage accreditations" ON public.accreditations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX acc_college_idx ON public.accreditations(college_id, status);
CREATE TRIGGER accreditations_updated BEFORE UPDATE ON public.accreditations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 8. RANKINGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rankings (
  id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id      uuid            NOT NULL REFERENCES public.colleges_v2(id) ON DELETE CASCADE,
  agency          ranking_agency  NOT NULL,
  category        text,                       -- "Engineering","Management","Overall","Medical"
  rank            int             NOT NULL,
  rank_band       text,                       -- "101-150" for banded rankings
  score           numeric(8,3),
  year            int             NOT NULL,
  country_rank    int,
  world_rank      int,
  source_url      text,
  provenance_id   uuid            REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at      timestamptz     NOT NULL DEFAULT now(),
  UNIQUE (college_id, agency, category, year)
);
GRANT SELECT ON public.rankings TO authenticated;
GRANT ALL    ON public.rankings TO service_role;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads rankings"    ON public.rankings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage rankings" ON public.rankings
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX rankings_college_idx ON public.rankings(college_id, year DESC);
CREATE INDEX rankings_agency_idx  ON public.rankings(agency, year DESC, rank);

-- ─── 9. PLACEMENTS ───────────────────────────────────────────
-- Per-college, per-degree, per-year placement statistics
CREATE TABLE IF NOT EXISTS public.placements (
  id                    uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id            uuid    NOT NULL REFERENCES public.colleges_v2(id) ON DELETE CASCADE,
  degree_id             uuid    REFERENCES public.degrees_v2(id)  ON DELETE SET NULL,
  batch_year            int     NOT NULL,
  -- Participation
  eligible_students     int,
  placed_students       int,
  placement_pct         numeric(5,2) GENERATED ALWAYS AS (
                          CASE WHEN eligible_students > 0
                          THEN ROUND((placed_students::numeric / eligible_students) * 100, 2)
                          ELSE NULL END
                        ) STORED,
  -- Salary (INR LPA — synthetic unless verified)
  median_salary_lpa     numeric(8,2),
  avg_salary_lpa        numeric(8,2),
  highest_salary_lpa    numeric(8,2),
  lowest_salary_lpa     numeric(8,2),
  -- Top recruiters
  top_recruiters        text[]  DEFAULT '{}',
  international_offers  int     DEFAULT 0,
  -- Provenance
  is_verified           boolean NOT NULL DEFAULT false,  -- false = synthetic/self-reported
  provenance_id         uuid    REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (college_id, degree_id, batch_year)
);
GRANT SELECT ON public.placements TO authenticated;
GRANT ALL    ON public.placements TO service_role;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads placements"    ON public.placements FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage placements" ON public.placements
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX placements_college_idx ON public.placements(college_id, batch_year DESC);
CREATE TRIGGER placements_updated BEFORE UPDATE ON public.placements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 10. SCHOLARSHIPS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scholarships (
  id                  uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text                NOT NULL,
  short_name          text,
  scope               scholarship_scope   NOT NULL DEFAULT 'national',
  -- Sponsoring body
  sponsor_name        text,               -- "Ministry of Education", "Tata Trust"
  sponsor_type        text
                      CHECK (sponsor_type IN ('government','corporate','ngo','institution','international')),
  -- Eligibility
  target_level        edu_level[],        -- which degree levels
  eligible_streams    text[],             -- ['Science','Commerce','Arts']
  eligible_states     text[],             -- empty = all India
  eligible_castes     text[],             -- ['SC','ST','OBC'] empty = all
  min_percentage      numeric(5,2),
  max_family_income   numeric(12,2),      -- annual INR
  -- Value (INR)
  amount_per_year     numeric(12,2),
  is_full_scholarship boolean DEFAULT false,
  covers_fees         boolean DEFAULT false,
  covers_living       boolean DEFAULT false,
  -- Application
  application_url     text,
  application_open    date,
  application_close   date,
  -- College linkage (NULL = open to any eligible college)
  college_id          uuid    REFERENCES public.colleges_v2(id) ON DELETE SET NULL,
  degree_id           uuid    REFERENCES public.degrees_v2(id)  ON DELETE SET NULL,
  -- Meta
  description         text,
  is_active           boolean NOT NULL DEFAULT true,
  provenance_id       uuid    REFERENCES public.source_provenance(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, sponsor_name, scope)
);
GRANT SELECT ON public.scholarships TO authenticated;
GRANT ALL    ON public.scholarships TO service_role;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth reads scholarships"    ON public.scholarships FOR SELECT TO authenticated USING (is_active);
CREATE POLICY "anon reads scholarships"    ON public.scholarships FOR SELECT TO anon          USING (is_active);
CREATE POLICY "admins manage scholarships" ON public.scholarships
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX scholarships_scope_idx  ON public.scholarships(scope, is_active);
CREATE INDEX scholarships_level_idx  ON public.scholarships USING gin(target_level);
CREATE TRIGGER scholarships_updated BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 11. LEGACY BRIDGE VIEWS ─────────────────────────────────
-- Keep existing code working while new tables fill up

CREATE OR REPLACE VIEW public.v_degrees AS
  SELECT
    d.id, d.name, d.short_name,
    d.level::text,
    d.duration_years, d.stream, d.description,
    d.avg_fees_total AS avg_fees,
    d.career_tags,
    d.is_active,
    d.created_at, d.updated_at
  FROM public.degrees_v2 d;

CREATE OR REPLACE VIEW public.v_colleges AS
  SELECT
    c.id, c.name, c.city, c.state,
    c.type::text,
    c.naac_grade,
    c.avg_fees_ug AS avg_fees,
    c.website, c.description,
    c.is_active,
    r.rank AS ranking,
    c.created_at, c.updated_at
  FROM public.colleges_v2 c
  LEFT JOIN LATERAL (
    SELECT rank FROM public.rankings
    WHERE college_id = c.id AND agency = 'nirf' AND category = 'Overall'
    ORDER BY year DESC LIMIT 1
  ) r ON true;

-- ─── 12. HELPER FUNCTION: import-safe upsert for colleges ─────
CREATE OR REPLACE FUNCTION public.upsert_college(
  p_name          text,
  p_city          text,
  p_state         text,
  p_type          text,
  p_short_name    text  DEFAULT NULL,
  p_slug          text  DEFAULT NULL,
  p_website       text  DEFAULT NULL,
  p_naac_grade    text  DEFAULT NULL,
  p_avg_fees_ug   numeric DEFAULT NULL,
  p_provenance    data_source DEFAULT 'synthetic'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prov_id uuid;
  v_id      uuid;
BEGIN
  -- Create provenance record
  INSERT INTO public.source_provenance(source, notes)
  VALUES (p_provenance, 'upserted via import function')
  RETURNING id INTO v_prov_id;

  INSERT INTO public.colleges_v2 (
    name, short_name, slug, type, city, state,
    website, naac_grade, avg_fees_ug, provenance_id
  ) VALUES (
    p_name, p_short_name,
    COALESCE(p_slug, lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'))),
    p_type::college_type,
    p_city, p_state, p_website, p_naac_grade, p_avg_fees_ug, v_prov_id
  )
  ON CONFLICT (name, city, state)
  DO UPDATE SET
    short_name  = EXCLUDED.short_name,
    type        = EXCLUDED.type,
    website     = COALESCE(EXCLUDED.website, public.colleges_v2.website),
    naac_grade  = COALESCE(EXCLUDED.naac_grade, public.colleges_v2.naac_grade),
    avg_fees_ug = COALESCE(EXCLUDED.avg_fees_ug, public.colleges_v2.avg_fees_ug),
    updated_at  = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.upsert_college FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.upsert_college TO service_role;

-- ─── 13. HELPER FUNCTION: import-safe upsert for degrees ──────
CREATE OR REPLACE FUNCTION public.upsert_degree(
  p_name           text,
  p_specialisation text,
  p_short_name     text,
  p_level          text,
  p_stream         text,
  p_mode           text    DEFAULT 'full_time',
  p_duration_years numeric DEFAULT 3,
  p_description    text    DEFAULT NULL,
  p_career_tags    text[]  DEFAULT '{}',
  p_avg_fees       numeric DEFAULT NULL,
  p_provenance     data_source DEFAULT 'synthetic'
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_prov_id uuid;
  v_id      uuid;
BEGIN
  INSERT INTO public.source_provenance(source, notes)
  VALUES (p_provenance, 'upserted via import function')
  RETURNING id INTO v_prov_id;

  INSERT INTO public.degrees_v2 (
    name, specialisation, short_name, level, stream, mode,
    duration_years, description, career_tags, avg_fees_total, provenance_id
  ) VALUES (
    p_name, p_specialisation, p_short_name, p_level::edu_level,
    p_stream, p_mode, p_duration_years, p_description,
    p_career_tags, p_avg_fees, v_prov_id
  )
  ON CONFLICT (name, specialisation, mode, level)
  DO UPDATE SET
    short_name     = EXCLUDED.short_name,
    stream         = COALESCE(EXCLUDED.stream, public.degrees_v2.stream),
    duration_years = EXCLUDED.duration_years,
    description    = COALESCE(EXCLUDED.description, public.degrees_v2.description),
    career_tags    = EXCLUDED.career_tags,
    avg_fees_total = COALESCE(EXCLUDED.avg_fees_total, public.degrees_v2.avg_fees_total),
    updated_at     = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.upsert_degree FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.upsert_degree TO service_role;

-- ─── 14. REFERENCE SEED DATA (SYNTHETIC) ─────────────────────
-- Marked with source = 'synthetic'. Do NOT rely on precise numbers.

-- Degree fields taxonomy
INSERT INTO public.degree_fields (name, stream) VALUES
  ('Computer Science & Engineering',  'Science'),
  ('Electronics & Communication Eng.','Science'),
  ('Mechanical Engineering',          'Science'),
  ('Civil Engineering',               'Science'),
  ('Chemical Engineering',            'Science'),
  ('Electrical Engineering',          'Science'),
  ('Aerospace Engineering',           'Science'),
  ('Biomedical Engineering',          'Science'),
  ('Information Technology',          'Science'),
  ('Artificial Intelligence & ML',    'Science'),
  ('Data Science & Analytics',        'Science'),
  ('Cybersecurity',                   'Science'),
  ('Physics',                         'Science'),
  ('Chemistry',                       'Science'),
  ('Mathematics & Statistics',        'Science'),
  ('Biology & Life Sciences',         'Science'),
  ('Biotechnology',                   'Science'),
  ('Agriculture & Food Tech',         'Science'),
  ('Environmental Science',           'Science'),
  ('Architecture & Planning',         'Science'),
  ('Business Administration',         'Commerce'),
  ('Commerce & Accountancy',          'Commerce'),
  ('Economics',                       'Commerce'),
  ('Finance & Banking',               'Commerce'),
  ('Marketing Management',            'Commerce'),
  ('Human Resource Management',       'Commerce'),
  ('Supply Chain & Logistics',        'Commerce'),
  ('Entrepreneurship',                'Commerce'),
  ('Hotel & Hospitality Management',  'Commerce'),
  ('Aviation Management',             'Commerce'),
  ('Law',                             'Commerce'),
  ('English Literature',              'Arts'),
  ('History',                         'Arts'),
  ('Political Science',               'Arts'),
  ('Psychology',                      'Arts'),
  ('Sociology',                       'Arts'),
  ('Philosophy',                      'Arts'),
  ('Fine Arts & Painting',            'Arts'),
  ('Industrial Design',               'Arts'),
  ('Fashion Design',                  'Arts'),
  ('Communication & Journalism',      'Arts'),
  ('Film & Media Studies',            'Arts'),
  ('Music',                           'Arts'),
  ('Social Work',                     'Arts'),
  ('Education (B.Ed)',                'Arts'),
  ('Library & Information Science',   'Arts'),
  ('Pharmacy',                        'Science'),
  ('Nursing',                         'Science'),
  ('Medicine (MBBS)',                 'Science'),
  ('Dentistry (BDS)',                 'Science'),
  ('Ayurveda (BAMS)',                 'Science')
ON CONFLICT (name) DO NOTHING;


-- Synthetic degree seed (sample — full 300+ to be imported via CSV)
DO $$
DECLARE
  f_cse uuid; f_ece uuid; f_mech uuid; f_civil uuid;
  f_ai uuid; f_ds uuid; f_biz uuid; f_fin uuid;
  f_law uuid; f_med uuid; f_pharma uuid; f_design uuid;
  f_econ uuid; f_psych uuid; f_bio uuid;
BEGIN
  SELECT id INTO f_cse   FROM public.degree_fields WHERE name='Computer Science & Engineering';
  SELECT id INTO f_ece   FROM public.degree_fields WHERE name='Electronics & Communication Eng.';
  SELECT id INTO f_mech  FROM public.degree_fields WHERE name='Mechanical Engineering';
  SELECT id INTO f_civil FROM public.degree_fields WHERE name='Civil Engineering';
  SELECT id INTO f_ai    FROM public.degree_fields WHERE name='Artificial Intelligence & ML';
  SELECT id INTO f_ds    FROM public.degree_fields WHERE name='Data Science & Analytics';
  SELECT id INTO f_biz   FROM public.degree_fields WHERE name='Business Administration';
  SELECT id INTO f_fin   FROM public.degree_fields WHERE name='Finance & Banking';
  SELECT id INTO f_law   FROM public.degree_fields WHERE name='Law';
  SELECT id INTO f_med   FROM public.degree_fields WHERE name='Medicine (MBBS)';
  SELECT id INTO f_pharma FROM public.degree_fields WHERE name='Pharmacy';
  SELECT id INTO f_design FROM public.degree_fields WHERE name='Industrial Design';
  SELECT id INTO f_econ  FROM public.degree_fields WHERE name='Economics';
  SELECT id INTO f_psych FROM public.degree_fields WHERE name='Psychology';
  SELECT id INTO f_bio   FROM public.degree_fields WHERE name='Biology & Life Sciences';

  INSERT INTO public.degrees_v2
    (name, short_name, level, specialisation, stream, duration_years, avg_fees_total, career_tags, field_id)
  VALUES
    -- B.Tech variants
    ('Bachelor of Technology','B.Tech','undergrad','Computer Science & Engineering','Science',4,600000,ARRAY['tech','software','ai'],f_cse),
    ('Bachelor of Technology','B.Tech','undergrad','Electronics & Communication','Science',4,550000,ARRAY['electronics','embedded','iot'],f_ece),
    ('Bachelor of Technology','B.Tech','undergrad','Mechanical Engineering','Science',4,500000,ARRAY['mechanical','manufacturing','robotics'],f_mech),
    ('Bachelor of Technology','B.Tech','undergrad','Civil Engineering','Science',4,450000,ARRAY['civil','construction','infrastructure'],f_civil),
    ('Bachelor of Technology','B.Tech','undergrad','Artificial Intelligence & ML','Science',4,700000,ARRAY['ai','ml','data'],f_ai),
    ('Bachelor of Technology','B.Tech','undergrad','Data Science','Science',4,650000,ARRAY['data','analytics','ml'],f_ds),
    ('Bachelor of Technology','B.Tech','undergrad','Cybersecurity','Science',4,600000,ARRAY['security','tech','networking'],f_cse),
    ('Bachelor of Technology','B.Tech','undergrad','Information Technology','Science',4,550000,ARRAY['tech','software'],f_cse),
    -- M.Tech variants
    ('Master of Technology','M.Tech','postgrad','Computer Science & Engineering','Science',2,300000,ARRAY['tech','research','software'],f_cse),
    ('Master of Technology','M.Tech','postgrad','Artificial Intelligence','Science',2,350000,ARRAY['ai','research','ml'],f_ai),
    ('Master of Technology','M.Tech','postgrad','Data Science & Engineering','Science',2,320000,ARRAY['data','analytics'],f_ds),
    -- Business
    ('Bachelor of Business Administration','BBA','undergrad','General Management','Commerce',3,350000,ARRAY['business','management'],f_biz),
    ('Bachelor of Business Administration','BBA','undergrad','Finance','Commerce',3,380000,ARRAY['finance','banking'],f_fin),
    ('Bachelor of Business Administration','BBA','undergrad','Marketing','Commerce',3,350000,ARRAY['marketing','sales'],f_biz),
    ('Master of Business Administration','MBA','postgrad','General Management','Commerce',2,1200000,ARRAY['business','leadership','strategy'],f_biz),
    ('Master of Business Administration','MBA','postgrad','Finance','Commerce',2,1400000,ARRAY['finance','investment','banking'],f_fin),
    ('Master of Business Administration','MBA','postgrad','Marketing','Commerce',2,1200000,ARRAY['marketing','brand','digital'],f_biz),
    ('Master of Business Administration','MBA','postgrad','Human Resources','Commerce',2,1000000,ARRAY['hr','people','management'],f_biz),
    -- Commerce
    ('Bachelor of Commerce','B.Com','undergrad','Accountancy & Finance','Commerce',3,200000,ARRAY['finance','accounting','ca'],f_fin),
    ('Bachelor of Commerce','B.Com','undergrad','Banking & Insurance','Commerce',3,220000,ARRAY['banking','finance'],f_fin),
    ('Bachelor of Commerce','B.Com (Hons.)','undergrad','Honours','Commerce',3,250000,ARRAY['finance','accounting','commerce'],f_fin),
    -- Law
    ('Bachelor of Laws','LLB','undergrad','General Law','Commerce',3,350000,ARRAY['law','legal','judiciary'],f_law),
    ('Bachelor of Legislative Law & Bachelor of Arts','BA LLB','integrated','Law & Arts','Arts',5,450000,ARRAY['law','legal'],f_law),
    ('Bachelor of Legislative Law & Bachelor of Business Admin','BBA LLB','integrated','Law & Business','Commerce',5,500000,ARRAY['law','corporate'],f_law),
    -- Medicine & Allied
    ('Bachelor of Medicine & Bachelor of Surgery','MBBS','undergrad','Medicine','Science',5.5,2500000,ARRAY['medicine','healthcare','doctor'],f_med),
    ('Bachelor of Dental Surgery','BDS','undergrad','Dentistry','Science',5,1800000,ARRAY['dentistry','healthcare'],f_med),
    ('Bachelor of Pharmacy','B.Pharm','undergrad','Pharmacy','Science',4,600000,ARRAY['pharmacy','healthcare','drug'],f_pharma),
    ('Doctor of Pharmacy','Pharm.D','undergrad','Clinical Pharmacy','Science',6,900000,ARRAY['pharmacy','clinical'],f_pharma),
    ('Bachelor of Physiotherapy','BPT','undergrad','Physiotherapy','Science',4.5,600000,ARRAY['healthcare','rehabilitation'],f_med),
    -- Design
    ('Bachelor of Design','B.Des','undergrad','Industrial Design','Arts',4,700000,ARRAY['design','product','ux'],f_design),
    ('Bachelor of Design','B.Des','undergrad','Communication Design','Arts',4,680000,ARRAY['design','graphic','branding'],f_design),
    ('Bachelor of Design','B.Des','undergrad','Fashion Design','Arts',4,750000,ARRAY['fashion','design','textile'],f_design),
    -- Arts / Social
    ('Bachelor of Arts','BA','undergrad','Economics','Arts',3,120000,ARRAY['economics','finance','research'],f_econ),
    ('Bachelor of Arts','BA','undergrad','Psychology','Arts',3,130000,ARRAY['psychology','counselling','hr'],f_psych),
    ('Bachelor of Science','B.Sc','undergrad','Data Science','Science',3,250000,ARRAY['data','analytics','tech'],f_ds),
    ('Bachelor of Science','B.Sc','undergrad','Biotechnology','Science',3,280000,ARRAY['biotech','research','pharma'],f_bio),
    -- Diploma
    ('Diploma in Engineering','Diploma','diploma','Computer Science','Science',3,150000,ARRAY['tech','software'],f_cse),
    ('Diploma in Engineering','Diploma','diploma','Mechanical Engineering','Science',3,130000,ARRAY['mechanical'],f_mech),
    -- PhD
    ('Doctor of Philosophy','Ph.D','doctorate','Computer Science','Science',5,100000,ARRAY['research','academia','ai'],f_cse),
    ('Doctor of Philosophy','Ph.D','doctorate','Management','Commerce',5,200000,ARRAY['research','academia','business'],f_biz)
  ON CONFLICT (name, specialisation, mode, level) DO NOTHING;
END $$;

-- Synthetic reference colleges (SAMPLE — full 5000+ imported via CSV)
-- NOTE: fees/rankings below are SYNTHETIC REFERENCE DATA
INSERT INTO public.colleges_v2
  (name, short_name, slug, type, city, state, naac_grade, avg_fees_ug, established_year, description)
VALUES
  ('Indian Institute of Technology Bombay','IIT Bombay','iit-bombay','iit','Mumbai','Maharashtra','A++',250000,1958,'Premier autonomous engineering & research institute'),
  ('Indian Institute of Technology Delhi','IIT Delhi','iit-delhi','iit','New Delhi','Delhi','A++',260000,1961,'Leading engineering institute under MoE'),
  ('Indian Institute of Technology Madras','IIT Madras','iit-madras','iit','Chennai','Tamil Nadu','A++',250000,1959,'Top-ranked engineering institution in India'),
  ('Indian Institute of Technology Kanpur','IIT Kanpur','iit-kanpur','iit','Kanpur','Uttar Pradesh','A++',240000,1959,'Pioneer in CS education in India'),
  ('Indian Institute of Technology Kharagpur','IIT Kharagpur','iit-kharagpur','iit','Kharagpur','West Bengal','A++',230000,1951,'Oldest IIT in India'),
  ('Indian Institute of Management Ahmedabad','IIM Ahmedabad','iim-ahmedabad','iim','Ahmedabad','Gujarat',NULL,2400000,1961,'Top management institute in India'),
  ('Indian Institute of Management Bangalore','IIM Bangalore','iim-bangalore','iim','Bengaluru','Karnataka',NULL,2300000,1973,'Premier management school'),
  ('Indian Institute of Management Calcutta','IIM Calcutta','iim-calcutta','iim','Kolkata','West Bengal',NULL,2200000,1961,'Among India''s oldest IIMs'),
  ('National Institute of Design Ahmedabad','NID Ahmedabad','nid-ahmedabad','autonomous','Ahmedabad','Gujarat','A',750000,1961,'India''s top design school'),
  ('Symbiosis Institute of Technology','SIT Pune','sit-pune','private_university','Pune','Maharashtra','A',950000,2008,'Reputed private engineering institute'),
  ('Manipal Institute of Technology','MIT Manipal','mit-manipal','deemed_university','Udupi','Karnataka','A+',1200000,1957,'Large private deemed university'),
  ('Vellore Institute of Technology','VIT Vellore','vit-vellore','deemed_university','Vellore','Tamil Nadu','A++',1100000,1984,'Top private tech university'),
  ('BITS Pilani','BITS Pilani','bits-pilani','deemed_university','Pilani','Rajasthan','A++',500000,1964,'Elite private engineering university'),
  ('Amity University Noida','Amity Noida','amity-noida','private_university','Noida','Uttar Pradesh','A',900000,2005,'Large private university'),
  ('Jadavpur University','JU Kolkata','jadavpur-university','state_university','Kolkata','West Bengal','A++',50000,1955,'Premier state engineering university')
ON CONFLICT (name, city, state) DO NOTHING;

-- Sample scholarships (SYNTHETIC / REFERENCE)
INSERT INTO public.scholarships
  (name, short_name, scope, sponsor_name, sponsor_type, target_level, amount_per_year, min_percentage, description, is_active)
VALUES
  ('National Merit Scholarship','NMS','national','Ministry of Education','government',
   ARRAY['undergrad']::edu_level[],12000,80,'Merit-based scholarship for undergrad students — verify current amounts on NSP portal',true),
  ('Post-Matric Scholarship for SC Students','PMS-SC','national','Ministry of Social Justice','government',
   ARRAY['undergrad','postgrad']::edu_level[],30000,NULL,'For SC category students — amounts vary by state. Reference only.',true),
  ('Prime Minister''s Scholarship Scheme','PMSS','national','Ministry of Home Affairs','government',
   ARRAY['undergrad']::edu_level[],25000,60,'For children of ex-servicemen and coast guard personnel',true),
  ('Inspire Scholarship','INSPIRE-SHE','national','Department of Science & Technology','government',
   ARRAY['undergrad']::edu_level[],80000,NULL,'For top 1% in class 12 pursuing Natural Sciences',true),
  ('AICTE Pragati Scholarship','Pragati','national','AICTE','government',
   ARRAY['diploma','undergrad']::edu_level[],50000,NULL,'For girl students in AICTE-approved technical programs',true),
  ('Tata Scholarship','Tata Cornell','national','Tata Trusts','corporate',
   ARRAY['postgrad']::edu_level[],2000000,NULL,'Fully funded scholarship for Indian students at Cornell University — highly competitive',true)
ON CONFLICT (name, sponsor_name, scope) DO NOTHING;

