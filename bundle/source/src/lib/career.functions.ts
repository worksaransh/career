import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AnswersSchema = z.record(z.string(), z.number().int().min(0).max(10));

type Career = {
  id: string;
  title: string;
  emoji: string;
  matchScore: number;
  why: string[];
  salaryEntry: number;
  salaryMid: number;
  demandIndex: number;
  aiRisk: "Low" | "Medium" | "High";
  education: string;
  alternatives: string[];
};

const FALLBACK_CAREERS: Career[] = [
  {
    id: "product-manager",
    title: "Product Manager",
    emoji: "🧭",
    matchScore: 90,
    why: ["Strong analytical + people skills", "Curious about how products are built", "High tolerance for ambiguity"],
    salaryEntry: 12,
    salaryMid: 35,
    demandIndex: 88,
    aiRisk: "Low",
    education: "BBA / B.Com / B.Tech + work experience",
    alternatives: ["Business Analyst", "UX Strategist", "Founder's Office"],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    emoji: "📊",
    matchScore: 86,
    why: ["You enjoy patterns & numbers", "Strong Math foundation", "Curious about AI"],
    salaryEntry: 9,
    salaryMid: 28,
    demandIndex: 94,
    aiRisk: "Medium",
    education: "B.Sc / B.Tech in CS, Stats or Math",
    alternatives: ["ML Engineer", "Analytics Consultant", "Quant Analyst"],
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    emoji: "🎨",
    matchScore: 80,
    why: ["Creative + empathetic", "Visual thinker", "Enjoys problem solving"],
    salaryEntry: 6,
    salaryMid: 22,
    demandIndex: 76,
    aiRisk: "Medium",
    education: "B.Des / Liberal Arts + portfolio",
    alternatives: ["Product Designer", "Researcher", "Brand Designer"],
  },
  {
    id: "ca",
    title: "Chartered Accountant",
    emoji: "📒",
    matchScore: 73,
    why: ["Disciplined", "Comfortable with rules", "Strong commerce inclination"],
    salaryEntry: 8,
    salaryMid: 25,
    demandIndex: 70,
    aiRisk: "High",
    education: "B.Com + CA Foundation/Inter/Final",
    alternatives: ["CFA", "CS", "Financial Analyst"],
  },
  {
    id: "civil-services",
    title: "Civil Services (UPSC)",
    emoji: "🏛️",
    matchScore: 67,
    why: ["Public-service motivation", "Strong general awareness", "Long-term mindset"],
    salaryEntry: 7,
    salaryMid: 18,
    demandIndex: 55,
    aiRisk: "Low",
    education: "Any graduation + UPSC prep",
    alternatives: ["State PSC", "Policy Researcher", "NGO Leadership"],
  },
];

async function generateCareers(answers: Record<string, number>, language: string): Promise<{ careers: Career[]; summary: string }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { careers: FALLBACK_CAREERS, summary: "Top matches based on your answers." };

  const prompt = `You are an expert career counsellor for Indian Class 11-12 students.
Given this student's assessment answers (each value is the option index 0-3 picked), produce 5 best-fit careers.

Answers: ${JSON.stringify(answers)}
Language for "why" bullets and summary: ${language === "hi" ? "Hindi" : language === "hinglish" ? "Hinglish (Roman script Hindi-English mix)" : "English"}

Return strictly via the tool call. Salary in INR LPA. matchScore 0-100. demandIndex 0-100. aiRisk: Low|Medium|High.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_careers",
              description: "Return 5 ranked careers",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  careers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        emoji: { type: "string" },
                        matchScore: { type: "number" },
                        why: { type: "array", items: { type: "string" } },
                        salaryEntry: { type: "number" },
                        salaryMid: { type: "number" },
                        demandIndex: { type: "number" },
                        aiRisk: { type: "string", enum: ["Low", "Medium", "High"] },
                        education: { type: "string" },
                        alternatives: { type: "array", items: { type: "string" } },
                      },
                      required: ["id", "title", "emoji", "matchScore", "why", "salaryEntry", "salaryMid", "demandIndex", "aiRisk", "education", "alternatives"],
                    },
                  },
                },
                required: ["summary", "careers"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_careers" } },
      }),
    });
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return { careers: FALLBACK_CAREERS, summary: "Top matches based on your answers." };
    }
    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { careers: FALLBACK_CAREERS, summary: "Top matches based on your answers." };
    const parsed = JSON.parse(args);
    return { careers: parsed.careers.slice(0, 5), summary: parsed.summary ?? "" };
  } catch (e) {
    console.error("AI call failed", e);
    return { careers: FALLBACK_CAREERS, summary: "Top matches based on your answers." };
  }
}

export const submitAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { answers: Record<string, number>; language: string }) => ({
    answers: AnswersSchema.parse(data.answers),
    language: z.enum(["en", "hi", "hinglish"]).parse(data.language),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: a, error: ae } = await supabase
      .from("assessments")
      .insert({ user_id: userId, answers: data.answers, language: data.language })
      .select("id")
      .single();
    if (ae || !a) throw new Error(ae?.message ?? "Failed to save assessment");

    const { careers, summary } = await generateCareers(data.answers, data.language);

    const { data: rec, error: re } = await supabase
      .from("recommendations")
      .insert({ user_id: userId, assessment_id: a.id, careers, summary })
      .select("id")
      .single();
    if (re || !rec) throw new Error(re?.message ?? "Failed to save recommendations");

    await supabase.from("profiles").update({ xp: 200 }).eq("id", userId);

    return { recommendationId: rec.id };
  });

export const getLatestRecommendation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("recommendations")
      .select("id, careers, summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data as { id: string; careers: Career[]; summary: string | null; created_at: string } | null;
  });

export const getParentDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: rec }, { data: profile }] = await Promise.all([
      supabase
        .from("recommendations")
        .select("careers, summary, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("full_name, class_level, stream, city").eq("id", userId).maybeSingle(),
    ]);

    const recCareers = (rec?.careers as Career[] | undefined) ?? FALLBACK_CAREERS;
    const top3 = recCareers.slice(0, 3);
    const titles = top3.map((c) => c.title);

    const { data: dbCareers } = titles.length
      ? await supabase
          .from("careers")
          .select("title, emoji, salary_entry, salary_mid, salary_senior, demand_index, ai_risk, future_demand, growth_rate, required_education, top_companies, remote_opportunities, degrees_accepted, category")
          .in("title", titles)
      : { data: [] as any[] };

    const { data: degrees } = await supabase
      .from("degrees")
      .select("name, duration, avg_cost, top_colleges")
      .limit(6);

    const { data: colleges } = await supabase
      .from("colleges")
      .select("name, city, state, type, ranking, avg_fees")
      .order("ranking", { ascending: true, nullsFirst: false })
      .limit(5);

    const enriched = top3.map((c) => {
      const db = (dbCareers ?? []).find(
        (x: any) => x.title?.toLowerCase() === c.title.toLowerCase(),
      );
      const entry = Number(db?.salary_entry ?? c.salaryEntry) || 0;
      const mid = Number(db?.salary_mid ?? c.salaryMid) || 0;
      const senior = Number(db?.salary_senior ?? mid * 2) || 0;
      const demand = Number(db?.demand_index ?? c.demandIndex) || 0;
      const aiRisk = (db?.ai_risk ?? c.aiRisk) as "Low" | "Medium" | "High";
      const growth = Number(db?.growth_rate ?? 8);
      // Rough education cost estimate (₹ lakhs) by inferred path
      const eduText = (db?.required_education ?? c.education ?? "").toLowerCase();
      const educationCostL = eduText.includes("b.tech") || eduText.includes("btech")
        ? 12
        : eduText.includes("medical") || eduText.includes("mbbs")
        ? 25
        : eduText.includes("mba") || eduText.includes("bba")
        ? 8
        : eduText.includes("ca") || eduText.includes("upsc")
        ? 3
        : 6;
      const fiveYearEarn = entry * 2 + mid * 3; // years 1-2 entry, 3-5 mid
      const roi = educationCostL > 0 ? +(fiveYearEarn / educationCostL).toFixed(1) : 0;
      const paybackMonths = entry > 0 ? Math.ceil((educationCostL / entry) * 12) : 0;
      return {
        id: c.id,
        title: c.title,
        emoji: db?.emoji ?? c.emoji,
        matchScore: c.matchScore,
        salaryEntry: entry,
        salaryMid: mid,
        salarySenior: senior,
        demandIndex: demand,
        aiRisk,
        growthRate: growth,
        futureDemand: db?.future_demand ?? (demand >= 80 ? "high" : demand >= 60 ? "medium" : "low"),
        remoteOpportunities: db?.remote_opportunities ?? "hybrid",
        education: db?.required_education ?? c.education,
        educationCostL,
        topCompanies: (db?.top_companies as string[] | null) ?? [],
        degreesAccepted: (db?.degrees_accepted as string[] | null) ?? [],
        fiveYearEarn,
        roi,
        paybackMonths,
      };
    });

    return {
      student: profile,
      generatedAt: rec?.created_at ?? null,
      careers: enriched,
      degrees: degrees ?? [],
      colleges: colleges ?? [],
    };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { full_name?: string; class_level?: string; stream?: string; city?: string; language?: string }) =>
    z
      .object({
        full_name: z.string().trim().min(1).max(120).optional(),
        class_level: z.string().trim().max(40).optional(),
        stream: z.string().trim().max(40).optional(),
        city: z.string().trim().max(80).optional(),
        language: z.enum(["en", "hi", "hinglish"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createShareLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: rec } = await supabase
      .from("recommendations")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!rec) throw new Error("Complete the assessment first");
    const token = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase
      .from("shared_reports")
      .insert({ token, user_id: userId, recommendation_id: rec.id });
    if (error) throw new Error(error.message);
    return { token };
  });

export const getSharedReport = createServerFn({ method: "GET" })
  .inputValidator((d: { token: string }) => ({ token: z.string().min(8).max(64).regex(/^[a-f0-9]+$/).parse(d.token) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: share } = await supabaseAdmin
      .from("shared_reports")
      .select("recommendation_id, user_id")
      .eq("token", data.token)
      .maybeSingle();
    if (!share) return null;
    const [{ data: rec }, { data: profile }] = await Promise.all([
      supabaseAdmin.from("recommendations").select("careers, summary, created_at").eq("id", share.recommendation_id!).maybeSingle(),
      supabaseAdmin.from("profiles").select("full_name, class_level, stream, city").eq("id", share.user_id).maybeSingle(),
    ]);
    if (!rec) return null;
    return {
      careers: rec.careers as Career[],
      summary: rec.summary,
      createdAt: rec.created_at,
      student: profile,
    };
  });
