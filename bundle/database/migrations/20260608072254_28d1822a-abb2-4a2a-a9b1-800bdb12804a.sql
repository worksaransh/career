
-- 1. Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 2. Catalog tables
CREATE TABLE public.careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  emoji text NOT NULL DEFAULT '💼',
  description text,
  salary_entry numeric,
  salary_mid numeric,
  demand_index integer DEFAULT 50,
  ai_risk text DEFAULT 'Medium' CHECK (ai_risk IN ('Low','Medium','High')),
  required_education text,
  alternatives text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.careers TO authenticated;
GRANT ALL ON public.careers TO service_role;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone signed in reads careers" ON public.careers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage careers" ON public.careers
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER careers_updated BEFORE UPDATE ON public.careers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.degrees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  level text DEFAULT 'undergrad' CHECK (level IN ('diploma','undergrad','postgrad','doctorate','certification')),
  duration_years numeric DEFAULT 3,
  stream text,
  description text,
  avg_fees numeric,
  career_tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.degrees TO authenticated;
GRANT ALL ON public.degrees TO service_role;
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone signed in reads degrees" ON public.degrees
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage degrees" ON public.degrees
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER degrees_updated BEFORE UPDATE ON public.degrees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text,
  type text DEFAULT 'private' CHECK (type IN ('government','private','deemed','autonomous')),
  ranking integer,
  avg_fees numeric,
  website text,
  offered_degrees text[] DEFAULT '{}',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.colleges TO authenticated;
GRANT ALL ON public.colleges TO service_role;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone signed in reads colleges" ON public.colleges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage colleges" ON public.colleges
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER colleges_updated BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Report moderation column
ALTER TABLE public.recommendations
  ADD COLUMN status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active','flagged','archived'));

-- 4. Admin RLS on existing tables (additive)
CREATE POLICY "admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins read all assessments" ON public.assessments
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins delete assessments" ON public.assessments
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "admins read all recs" ON public.recommendations
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins update recs" ON public.recommendations
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "admins delete recs" ON public.recommendations
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "admins read all shares" ON public.shared_reports
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "admins delete shares" ON public.shared_reports
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- 5. Seed first admin (idempotent — runs only if the user exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE lower(email) = lower('work.saranshgulati@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Seed a few catalog rows so admin screens aren't empty
INSERT INTO public.careers (title, emoji, description, salary_entry, salary_mid, demand_index, ai_risk, required_education, alternatives, tags) VALUES
  ('Product Manager', '🧭', 'Owns product strategy & roadmap', 12, 35, 88, 'Low', 'BBA / B.Tech + experience', ARRAY['Business Analyst','Founder''s Office'], ARRAY['business','tech']),
  ('Data Scientist', '📊', 'Builds ML models & insights', 9, 28, 94, 'Medium', 'B.Tech/B.Sc CS or Stats', ARRAY['ML Engineer','Quant'], ARRAY['ai','math']),
  ('UX Designer', '🎨', 'Designs user experiences', 6, 22, 76, 'Medium', 'B.Des + portfolio', ARRAY['Product Designer'], ARRAY['design','creative']),
  ('Chartered Accountant', '📒', 'Audit, tax & advisory', 8, 25, 70, 'High', 'B.Com + CA', ARRAY['CFA','CS'], ARRAY['finance']),
  ('Civil Services', '🏛️', 'IAS/IPS/IFS via UPSC', 7, 18, 55, 'Low', 'Graduation + UPSC', ARRAY['State PSC'], ARRAY['government']);

INSERT INTO public.degrees (name, short_name, level, duration_years, stream, description, avg_fees, career_tags) VALUES
  ('Bachelor of Technology', 'B.Tech', 'undergrad', 4, 'Science', 'Engineering undergraduate degree', 400000, ARRAY['tech','ai']),
  ('Bachelor of Business Administration', 'BBA', 'undergrad', 3, 'Commerce', 'Business undergraduate degree', 300000, ARRAY['business']),
  ('Bachelor of Design', 'B.Des', 'undergrad', 4, 'Arts', 'Design undergraduate degree', 600000, ARRAY['design','creative']),
  ('Bachelor of Commerce', 'B.Com', 'undergrad', 3, 'Commerce', 'Commerce undergraduate degree', 150000, ARRAY['finance','business']);

INSERT INTO public.colleges (name, city, state, type, ranking, avg_fees, offered_degrees, description) VALUES
  ('IIT Bombay', 'Mumbai', 'Maharashtra', 'government', 1, 250000, ARRAY['B.Tech','M.Tech'], 'Premier engineering institute'),
  ('IIM Ahmedabad', 'Ahmedabad', 'Gujarat', 'autonomous', 1, 2400000, ARRAY['MBA'], 'Top management institute'),
  ('NID Ahmedabad', 'Ahmedabad', 'Gujarat', 'autonomous', 1, 800000, ARRAY['B.Des','M.Des'], 'Top design institute'),
  ('SRCC Delhi', 'New Delhi', 'Delhi', 'government', 1, 60000, ARRAY['B.Com','BA Economics'], 'Top commerce college');
