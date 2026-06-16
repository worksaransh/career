import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// --- helpers ---------------------------------------------------------------

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// --- access check exposed to client ---------------------------------------

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

// --- overview --------------------------------------------------------------

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [users, assessments, recs, shares, careers, degrees, colleges] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("assessments").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("recommendations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("shared_reports").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("careers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("degrees").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("colleges").select("*", { count: "exact", head: true }),
    ]);
    return {
      users: users.count ?? 0,
      assessments: assessments.count ?? 0,
      recommendations: recs.count ?? 0,
      shares: shares.count ?? 0,
      careers: careers.count ?? 0,
      degrees: degrees.count ?? 0,
      colleges: colleges.count ?? 0,
    };
  });

// --- USERS -----------------------------------------------------------------

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, class_level, stream, city, language, xp, streak, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "admin" | "user"; grant: boolean }) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "user"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => ({ userId: z.string().uuid().parse(d.userId) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("Cannot delete yourself");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --- ANALYTICS -------------------------------------------------------------

export const getAssessmentAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assessments } = await supabaseAdmin
      .from("assessments")
      .select("created_at, language")
      .order("created_at", { ascending: false })
      .limit(2000);
    const { data: recs } = await supabaseAdmin
      .from("recommendations")
      .select("careers, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    // Daily counts (last 14 days)
    const byDay = new Map<string, number>();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      byDay.set(d.toISOString().slice(0, 10), 0);
    }
    (assessments ?? []).forEach((a) => {
      const key = a.created_at.slice(0, 10);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    });

    // Language distribution
    const langCounts: Record<string, number> = { en: 0, hi: 0, hinglish: 0 };
    (assessments ?? []).forEach((a) => {
      langCounts[a.language] = (langCounts[a.language] ?? 0) + 1;
    });

    // Top recommended careers
    const careerCounts = new Map<string, number>();
    (recs ?? []).forEach((r) => {
      const list = (r.careers as Array<{ title?: string }>) ?? [];
      list.forEach((c) => {
        if (!c?.title) return;
        careerCounts.set(c.title, (careerCounts.get(c.title) ?? 0) + 1);
      });
    });
    const topCareers = Array.from(careerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));

    return {
      totalAssessments: assessments?.length ?? 0,
      totalRecommendations: recs?.length ?? 0,
      daily: Array.from(byDay.entries()).map(([date, count]) => ({ date, count })),
      languages: langCounts,
      topCareers,
    };
  });

// --- CATALOG (careers / degrees / colleges) --------------------------------

const CareerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(120),
  emoji: z.string().trim().min(1).max(8).default("💼"),
  description: z.string().trim().max(2000).nullable().optional(),
  salary_entry: z.number().nullable().optional(),
  salary_mid: z.number().nullable().optional(),
  demand_index: z.number().int().min(0).max(100).nullable().optional(),
  ai_risk: z.enum(["Low", "Medium", "High"]).default("Medium"),
  required_education: z.string().trim().max(500).nullable().optional(),
  alternatives: z.array(z.string().max(120)).max(20).default([]),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

const DegreeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  short_name: z.string().trim().max(40).nullable().optional(),
  level: z.enum(["diploma", "undergrad", "postgrad", "doctorate", "certification"]),
  duration_years: z.number().min(0).max(10).default(3),
  stream: z.string().trim().max(60).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  avg_fees: z.number().nullable().optional(),
  career_tags: z.array(z.string().max(40)).max(20).default([]),
});

const CollegeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().max(80).nullable().optional(),
  state: z.string().trim().max(80).nullable().optional(),
  type: z.enum(["government", "private", "deemed", "autonomous"]),
  ranking: z.number().int().nullable().optional(),
  avg_fees: z.number().nullable().optional(),
  website: z.string().url().max(300).nullable().optional().or(z.literal("")),
  offered_degrees: z.array(z.string().max(40)).max(30).default([]),
  description: z.string().trim().max(2000).nullable().optional(),
});

function buildCrud<T extends z.ZodTypeAny>(table: "careers" | "degrees" | "colleges", schema: T) {
  const list = createServerFn({ method: "GET" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
      await assertAdmin(context.userId);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    });

  const upsert = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((d: unknown) => schema.parse(d) as z.infer<T>)
    .handler(async ({ data, context }) => {
      await assertAdmin(context.userId);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const payload: Record<string, unknown> = { ...(data as Record<string, unknown>) };
      if (!payload.id) delete payload.id;
      const { error } = await supabaseAdmin.from(table).upsert(payload as never);
      if (error) throw new Error(error.message);
      return { ok: true };
    });

  const remove = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
    .handler(async ({ data, context }) => {
      await assertAdmin(context.userId);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from(table).delete().eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    });

  return { list, upsert, remove };
}

const careersCrud = buildCrud("careers", CareerSchema);
const degreesCrud = buildCrud("degrees", DegreeSchema);
const collegesCrud = buildCrud("colleges", CollegeSchema);

export const listCareers = careersCrud.list;
export const upsertCareer = careersCrud.upsert;
export const deleteCareer = careersCrud.remove;

export const listDegrees = degreesCrud.list;
export const upsertDegree = degreesCrud.upsert;
export const deleteDegree = degreesCrud.remove;

export const listColleges = collegesCrud.list;
export const upsertCollege = collegesCrud.upsert;
export const deleteCollege = collegesCrud.remove;

// --- REPORTS ---------------------------------------------------------------

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: recs } = await supabaseAdmin
      .from("recommendations")
      .select("id, user_id, summary, careers, status, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    const ids = Array.from(new Set((recs ?? []).map((r) => r.user_id)));
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, email, full_name").in("id", ids)
      : { data: [] as Array<{ id: string; email: string | null; full_name: string | null }> };
    const pMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    return (recs ?? []).map((r) => ({
      ...r,
      careerCount: Array.isArray(r.careers) ? r.careers.length : 0,
      user: pMap.get(r.user_id) ?? null,
    }));
  });

export const updateReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "active" | "flagged" | "archived" }) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["active", "flagged", "archived"]) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("recommendations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("recommendations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
