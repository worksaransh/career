"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma/prisma";
import { requireRole } from "@/lib/session/session";

/**
 * Overview statistics
 */
export async function getAdminOverview() {
  await requireRole("SUPER_ADMIN", "ADMIN", "ANALYST", "CONTENT_MANAGER");

  const [
    usersCount,
    assessmentsCount,
    careersCount,
    degreesCount,
    collegesCount,
    paymentsCount,
    couponsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.assessmentResult.count(),
    prisma.career.count(),
    prisma.degree.count(),
    prisma.college.count(),
    prisma.payment.count(),
    prisma.coupon.count(),
  ]);

  return {
    users: usersCount,
    assessments: assessmentsCount,
    careers: careersCount,
    degrees: degreesCount,
    colleges: collegesCount,
    payments: paymentsCount,
    coupons: couponsCount,
  };
}

/**
 * Assessment & Matched Careers analytics
 */
export async function getAssessmentAnalytics() {
  await requireRole("SUPER_ADMIN", "ADMIN", "ANALYST");

  const assessments = await prisma.assessmentResult.findMany({
    select: { completedAt: true, type: true },
    orderBy: { completedAt: "desc" },
    take: 1000,
  });

  const byDay = new Map<string, number>();
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }

  assessments.forEach((a) => {
    const key = a.completedAt.toISOString().slice(0, 10);
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
  });

  // Calculate top recommended careers across results
  const recs = await prisma.assessmentResult.findMany({
    select: { scores: true },
    take: 500,
  });

  const careerCounts = new Map<string, number>();
  recs.forEach((r) => {
    const scores = r.scores as any;
    if (scores && Array.isArray(scores.recommendedCareers)) {
      scores.recommendedCareers.forEach((cName: string) => {
        careerCounts.set(cName, (careerCounts.get(cName) ?? 0) + 1);
      });
    }
  });

  const topCareers = Array.from(careerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([title, count]) => ({ title, count }));

  return {
    daily: Array.from(byDay.entries()).map(([date, count]) => ({ date, count })),
    topCareers,
  };
}

/**
 * User Operations
 */
export async function listUsers() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: true },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    profile: u.profile
      ? {
          interests: u.profile.interests,
          educationLevel: u.profile.educationLevel,
          currentGrade: u.profile.currentGrade,
          location: u.profile.location,
        }
      : null,
  }));
}

export async function updateUserRole(userId: string, role: string) {
  await requireRole("SUPER_ADMIN");

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  return { success: true, user };
}

export async function deleteUser(userId: string) {
  const adminUser = await requireRole("SUPER_ADMIN");
  if (adminUser.id === userId) {
    throw new Error("Cannot delete yourself");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Career Catalog Operations
 */
export async function listCareers() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  return prisma.career.findMany({
    orderBy: { title: "asc" },
  });
}

export async function upsertCareer(data: any) {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, ...rest } = data;
  const slug = rest.slug || rest.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const payload = {
    title: rest.title,
    slug,
    description: rest.description || rest.title,
    summary: rest.summary || rest.description || rest.title,
    salaryEntry: Number(rest.salaryEntry || 400000),
    salaryMid: Number(rest.salaryMid || 1200000),
    salarySenior: Number(rest.salarySenior || 2500000),
    salaryCurrency: rest.salaryCurrency || "INR",
    tenYearGrowthPercent: Number(rest.tenYearGrowthPercent || 15.0),
    demandLevel: rest.demandLevel || "MEDIUM",
    aiRiskLevel: rest.aiRiskLevel || "MEDIUM",
    futureGrowthRate: Number(rest.futureGrowthRate || 15.0),
    requiredSkills: Array.isArray(rest.requiredSkills) ? rest.requiredSkills : [],
    recommendedDegrees: Array.isArray(rest.recommendedDegrees) ? rest.recommendedDegrees : [],
    certifications: Array.isArray(rest.certifications) ? rest.certifications : [],
    alternativeCareers: Array.isArray(rest.alternativeCareers) ? rest.alternativeCareers : [],
    isActive: rest.isActive ?? true,
    seoMetadata: rest.seoMetadata || {},
  };

  let career;
  if (id) {
    career = await prisma.career.update({
      where: { id },
      data: payload,
    });
  } else {
    career = await prisma.career.create({
      data: payload,
    });
  }

  revalidatePath("/admin/careers");
  return career;
}

export async function deleteCareer(id: string) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.career.delete({
    where: { id },
  });
  revalidatePath("/admin/careers");
  return { success: true };
}

/**
 * Degree Catalog Operations
 */
export async function listDegrees() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  return prisma.degree.findMany({
    orderBy: { name: "asc" },
  });
}

export async function upsertDegree(data: any) {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, ...rest } = data;
  const slug = rest.slug || rest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const payload = {
    name: rest.name,
    slug,
    description: rest.description || rest.name,
    duration: rest.duration || "3 Years",
    costTotal: Number(rest.costTotal || 0),
    costTuition: Number(rest.costTuition || 0),
    costFees: Number(rest.costFees || 0),
    costLiving: Number(rest.costLiving || 0),
    costCurrency: rest.costCurrency || "INR",
    fiveYearReturn: Number(rest.fiveYearReturn || 0),
    tenYearReturn: Number(rest.tenYearReturn || 0),
    lifetimeReturn: Number(rest.lifetimeReturn || 0),
    breakEvenPeriod: Number(rest.breakEvenPeriod || 0),
    riskAdjustedScore: Number(rest.riskAdjustedScore || 0.0),
    aiResilience: Number(rest.aiResilience || 0.0),
    careerOutcomes: rest.careerOutcomes || [],
    futureOpportunities: Array.isArray(rest.futureOpportunities) ? rest.futureOpportunities : [],
    requiredSubjects: Array.isArray(rest.requiredSubjects) ? rest.requiredSubjects : [],
    isActive: rest.isActive ?? true,
    seoMetadata: rest.seoMetadata || {},
  };

  let degree;
  if (id) {
    degree = await prisma.degree.update({
      where: { id },
      data: payload,
    });
  } else {
    degree = await prisma.degree.create({
      data: payload,
    });
  }

  revalidatePath("/admin/degrees");
  return degree;
}

export async function deleteDegree(id: string) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.degree.delete({
    where: { id },
  });
  revalidatePath("/admin/degrees");
  return { success: true };
}

/**
 * College Catalog Operations
 */
export async function listColleges() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  return prisma.college.findMany({
    orderBy: { name: "asc" },
  });
}

export async function upsertCollege(data: any) {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, ...rest } = data;
  const slug = rest.slug || rest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const payload = {
    name: rest.name,
    slug,
    description: rest.description || rest.name,
    location: rest.location || "India",
    ranking: Number(rest.ranking || 9999),
    feesTotal: Number(rest.feesTotal || 0),
    feesTuition: Number(rest.feesTuition || 0),
    feesLiving: Number(rest.feesLiving || 0),
    feesCurrency: rest.feesCurrency || "INR",
    avgPackage: Number(rest.avgPackage || 400000),
    highestPackage: Number(rest.highestPackage || 1200000),
    placementPercent: Number(rest.placementPercent || 75.0),
    topRecruiters: Array.isArray(rest.topRecruiters) ? rest.topRecruiters : [],
    fiveYearReturn: Number(rest.fiveYearReturn || 0),
    tenYearReturn: Number(rest.tenYearReturn || 0),
    lifetimeReturn: Number(rest.lifetimeReturn || 0),
    breakEvenPeriod: Number(rest.breakEvenPeriod || 0),
    riskAdjustedScore: Number(rest.riskAdjustedScore || 0.0),
    rating: Number(rest.rating || 0.0),
    reviewCount: Number(rest.reviewCount || 0),
    studentCount: Number(rest.studentCount || 0),
    studentFitScore: Number(rest.studentFitScore || 0.0),
    similarColleges: Array.isArray(rest.similarColleges) ? rest.similarColleges : [],
    isActive: rest.isActive ?? true,
    seoMetadata: rest.seoMetadata || {},
  };

  let college;
  if (id) {
    college = await prisma.college.update({
      where: { id },
      data: payload,
    });
  } else {
    college = await prisma.college.create({
      data: payload,
    });
  }

  revalidatePath("/admin/colleges");
  return college;
}

export async function deleteCollege(id: string) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.college.delete({
    where: { id },
  });
  revalidatePath("/admin/colleges");
  return { success: true };
}

/**
 * Coupon Operations
 */
export async function listCoupons() {
  await requireRole("SUPER_ADMIN", "ADMIN", "FINANCE");
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertCoupon(data: any) {
  await requireRole("SUPER_ADMIN", "ADMIN", "FINANCE");
  const { id, code, discountPercentage, maxUses, expiresAt, isActive } = data;

  const payload = {
    code: code.toUpperCase().trim(),
    discountPercentage: Number(discountPercentage),
    maxUses: maxUses ? Number(maxUses) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isActive: isActive ?? true,
  };

  let coupon;
  if (id) {
    coupon = await prisma.coupon.update({
      where: { id },
      data: payload,
    });
  } else {
    coupon = await prisma.coupon.create({
      data: payload,
    });
  }

  revalidatePath("/admin/payments");
  return coupon;
}

export async function deleteCoupon(id: string) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.coupon.delete({
    where: { id },
  });
  revalidatePath("/admin/payments");
  return { success: true };
}

/**
 * CMS Content Operations
 */
export async function listCMSContents() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  return prisma.cMSContent.findMany({
    orderBy: { key: "asc" },
  });
}

export async function upsertCMSContent(data: any) {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, key, section, type, value, language, isActive } = data;

  const payload = {
    key: key.trim(),
    section: section.trim(),
    type: type || "TEXT",
    value: value || "",
    language: language || "en",
    isActive: isActive ?? true,
  };

  let cms;
  if (id) {
    cms = await prisma.cMSContent.update({
      where: { id },
      data: payload,
    });
  } else {
    cms = await prisma.cMSContent.create({
      data: payload,
    });
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return cms;
}

export async function deleteCMSContent(id: string) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.cMSContent.delete({
    where: { id },
  });
  revalidatePath("/admin/content");
  return { success: true };
}

/**
 * Payments List
 */
export async function listPayments() {
  await requireRole("SUPER_ADMIN", "ADMIN", "FINANCE");
  return prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Audit Trail Logging Helper
 */
export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details: any = {}
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details || {},
        ip: "127.0.0.1",
        userAgent: "Enterprise Admin Panel",
      },
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
    return null;
  }
}

export async function listAuditLogs() {
  await requireRole("SUPER_ADMIN", "ANALYST");
  return prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    take: 500,
  });
}

/**
 * User Impersonation & Extended Admin Actions
 */
export async function impersonateUser(userId: string) {
  const admin = await requireRole("SUPER_ADMIN");
  await logAuditEvent(admin.id, "IMPERSONATE", "User", userId, { targetUserId: userId });
  return { success: true, userId };
}

export async function toggleUserSuspension(userId: string, suspend: boolean) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  const role = suspend ? "SUSPENDED" : "USER";
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  await logAuditEvent(admin.id, suspend ? "SUSPEND" : "UNSUSPEND", "User", userId);
  return { success: true, user };
}

export async function grantPremiumTier(userId: string, premium: boolean) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN", "FINANCE");
  const end = premium ? new Date("2035-12-31T23:59:59Z") : new Date();
  
  const sub = await prisma.subscription.findFirst({ where: { userId } });
  let result;
  if (sub) {
    result = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        tier: premium ? "PREMIUM" : "FREE",
        status: premium ? "ACTIVE" : "EXPIRED",
        currentPeriodEnd: end,
      },
    });
  } else {
    result = await prisma.subscription.create({
      data: {
        userId,
        tier: premium ? "PREMIUM" : "FREE",
        status: premium ? "ACTIVE" : "EXPIRED",
        currentPeriodEnd: end,
      },
    });
  }
  
  await logAuditEvent(admin.id, premium ? "GRANT_PREMIUM" : "REVOKE_PREMIUM", "User", userId);
  return { success: true, subscription: result };
}

export async function assignUserTags(userId: string, tags: string[]) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.userProfile.upsert({
    where: { userId },
    update: { interests: tags },
    create: { userId, interests: tags },
  });
  await logAuditEvent(admin.id, "TAG_USER", "User", userId, { tags });
  return { success: true };
}

/**
 * Skills Catalog CRUD
 */
export async function listSkills() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST");
  return prisma.skill.findMany({
    orderBy: { name: "asc" },
  });
}

export async function upsertSkill(data: any) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, ...rest } = data;
  const payload = {
    name: rest.name.trim(),
    category: rest.category.trim(),
    description: rest.description || "",
    difficulty: rest.difficulty || "MEDIUM",
    demand: rest.demand || "MEDIUM",
  };

  let skill;
  if (id) {
    skill = await prisma.skill.update({
      where: { id },
      data: payload,
    });
    await logAuditEvent(admin.id, "UPDATE", "Skill", skill.id, payload);
  } else {
    skill = await prisma.skill.create({
      data: payload,
    });
    await logAuditEvent(admin.id, "CREATE", "Skill", skill.id, payload);
  }
  return skill;
}

export async function deleteSkill(id: string) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.skill.delete({ where: { id } });
  await logAuditEvent(admin.id, "DELETE", "Skill", id);
  return { success: true };
}

/**
 * Certifications Catalog CRUD
 */
export async function listCertifications() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST");
  return prisma.certification.findMany({
    orderBy: { name: "asc" },
  });
}

export async function upsertCertification(data: any) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, ...rest } = data;
  const payload = {
    name: rest.name.trim(),
    provider: rest.provider.trim(),
    cost: Number(rest.cost || 0),
    duration: rest.duration || "",
    skillsCovered: Array.isArray(rest.skillsCovered) ? rest.skillsCovered : [],
    affiliateLink: rest.affiliateLink || null,
  };

  let cert;
  if (id) {
    cert = await prisma.certification.update({
      where: { id },
      data: payload,
    });
    await logAuditEvent(admin.id, "UPDATE", "Certification", cert.id, payload);
  } else {
    cert = await prisma.certification.create({
      data: payload,
    });
    await logAuditEvent(admin.id, "CREATE", "Certification", cert.id, payload);
  }
  return cert;
}

export async function deleteCertification(id: string) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.certification.delete({ where: { id } });
  await logAuditEvent(admin.id, "DELETE", "Certification", id);
  return { success: true };
}

/**
 * AI Prompt Templates CRUD
 */
export async function listAIPrompts() {
  await requireRole("SUPER_ADMIN", "ADMIN");
  return prisma.aIPrompt.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertAIPrompt(data: any) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  const { key, template, description } = data;
  
  // Find highest version of this key
  const latest = await prisma.aIPrompt.findFirst({
    where: { key },
    orderBy: { version: "desc" },
  });

  const nextVer = latest ? latest.version + 1 : 1;

  const prompt = await prisma.aIPrompt.create({
    data: {
      key,
      template,
      version: nextVer,
      description: description || `Version ${nextVer} update`,
    },
  });

  await logAuditEvent(admin.id, "UPSERT_PROMPT", "AIPrompt", key, { version: nextVer });
  return prompt;
}

export async function rollbackAIPrompt(key: string, version: number) {
  const admin = await requireRole("SUPER_ADMIN");
  const target = await prisma.aIPrompt.findUnique({
    where: { key_version: { key, version } },
  });

  if (!target) throw new Error("Target prompt version not found");

  const latest = await prisma.aIPrompt.findFirst({
    where: { key },
    orderBy: { version: "desc" },
  });
  
  const nextVer = latest ? latest.version + 1 : 1;

  const prompt = await prisma.aIPrompt.create({
    data: {
      key,
      template: target.template,
      version: nextVer,
      description: `Rollback to v${version}`,
    },
  });

  await logAuditEvent(admin.id, "ROLLBACK_PROMPT", "AIPrompt", key, { toVersion: version, newVersion: nextVer });
  return prompt;
}

/**
 * System Settings Configuration
 */
export async function listSystemSettings() {
  await requireRole("SUPER_ADMIN", "ADMIN", "ANALYST");
  return prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });
}

export async function upsertSystemSetting(key: string, value: string, description?: string) {
  const admin = await requireRole("SUPER_ADMIN");
  const setting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  });
  await logAuditEvent(admin.id, "CHANGE_SETTING", "SystemSetting", key, { value });
  return setting;
}

/**
 * Assessment Builder Questions CRUD
 */
export async function listAssessmentQuestions() {
  await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  // Find first assessment
  const assess = await prisma.assessment.findFirst();
  if (!assess) return [];

  return prisma.assessmentQuestion.findMany({
    where: { assessmentId: assess.id },
    orderBy: { order: "asc" },
  });
}

export async function upsertAssessmentQuestion(data: any) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const { id, text, category, order, options } = data;
  
  let assess = await prisma.assessment.findFirst();
  if (!assess) {
    assess = await prisma.assessment.create({
      data: {
        type: "CAREER_GPS",
        title: "Standard CareerGPS Assessment",
        description: "AI-Powered evaluations to map careers.",
        timeEstimate: 15,
      },
    });
  }

  const payload = {
    assessmentId: assess.id,
    text,
    category: category || "General",
    order: Number(order || 0),
    options: options || [],
  };

  let q;
  if (id) {
    q = await prisma.assessmentQuestion.update({
      where: { id },
      data: payload,
    });
    await logAuditEvent(admin.id, "UPDATE", "AssessmentQuestion", q.id, payload);
  } else {
    q = await prisma.assessmentQuestion.create({
      data: payload,
    });
    await logAuditEvent(admin.id, "CREATE", "AssessmentQuestion", q.id, payload);
  }
  return q;
}

export async function deleteAssessmentQuestion(id: string) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  await prisma.assessmentQuestion.delete({ where: { id } });
  await logAuditEvent(admin.id, "DELETE", "AssessmentQuestion", id);
  return { success: true };
}

export async function reorderAssessmentQuestions(orderedIds: string[]) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER");
  const updates = orderedIds.map((id, index) =>
    prisma.assessmentQuestion.update({
      where: { id },
      data: { order: index },
    })
  );
  await prisma.$transaction(updates);
  await logAuditEvent(admin.id, "REORDER", "AssessmentQuestion", "bulk", { count: orderedIds.length });
  return { success: true };
}

/**
 * Campaigns & Notifications Trigger
 */
export async function createNotificationCampaign(data: any) {
  const admin = await requireRole("SUPER_ADMIN", "ADMIN");
  const { title, body, userType, language, geography } = data;

  // Query matching target users
  const query: any = {};
  if (userType && userType !== "ALL") {
    query.role = userType;
  }
  if (language && language !== "ALL") {
    query.language = language;
  }

  const targetUsers = await prisma.user.findMany({
    where: query,
    select: { id: true },
  });

  const notifs = targetUsers.map((u) =>
    prisma.notification.create({
      data: {
        userId: u.id,
        type: "CAMPAIGN",
        channel: "IN_APP",
        title,
        body,
        data: { createdBy: admin.id, campaignName: title },
      },
    })
  );

  await prisma.$transaction(notifs);
  await logAuditEvent(admin.id, "TRIGGER_CAMPAIGN", "Notification", "bulk", {
    title,
    sentCount: targetUsers.length,
  });

  return { success: true, sentCount: targetUsers.length };
}

export async function getEnterpriseDashboardOverview() {
  await requireRole("SUPER_ADMIN", "ADMIN", "ANALYST", "CONTENT_MANAGER", "FINANCE", "SUPPORT_AGENT");

  // Get active signups today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsersToday,
    premiumUsers,
    assessmentsToday,
    cmsCount,
    auditsCount,
    skillsCount,
    certCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.subscription.count({ where: { tier: "PREMIUM", status: "ACTIVE" } }),
    prisma.assessmentResult.count({ where: { completedAt: { gte: todayStart } } }),
    prisma.cMSContent.count(),
    prisma.auditLog.count(),
    prisma.skill.count(),
    prisma.certification.count(),
  ]);

  // Breakdown roles
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const rolesBreakdown = usersByRole.reduce((acc: any, curr) => {
    acc[curr.role] = curr._count.id;
    return acc;
  }, {});

  return {
    totalUsers,
    newUsersToday,
    premiumUsers,
    assessmentsToday,
    cmsCount,
    auditsCount,
    skillsCount,
    certCount,
    rolesBreakdown,
  };
}

