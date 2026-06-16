CREATE OR REPLACE FUNCTION public.prepare_degree_catalog_record()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE base_code text;
BEGIN
  NEW.canonical_name := COALESCE(NULLIF(NEW.canonical_name, ''), NEW.name);
  IF NEW.degree_code IS NULL OR NEW.degree_code = '' THEN
    base_code := lower(regexp_replace(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'));
    NEW.degree_code := base_code || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER prepare_degree_catalog_before_write BEFORE INSERT OR UPDATE ON public.degrees FOR EACH ROW EXECUTE FUNCTION public.prepare_degree_catalog_record();

CREATE OR REPLACE FUNCTION public.prepare_college_catalog_record()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE base_code text;
BEGIN
  NEW.canonical_name := COALESCE(NULLIF(NEW.canonical_name, ''), NEW.name);
  IF NEW.college_code IS NULL OR NEW.college_code = '' THEN
    base_code := lower(regexp_replace(regexp_replace(NEW.name || '-' || COALESCE(NEW.city, ''), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'));
    NEW.college_code := base_code || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER prepare_college_catalog_before_write BEFORE INSERT OR UPDATE ON public.colleges FOR EACH ROW EXECUTE FUNCTION public.prepare_college_catalog_record();