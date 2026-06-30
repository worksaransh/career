import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma/prisma";
import { getSession } from "@/lib/session/session";
import { recalculateScores } from "@/lib/actions/vault-actions";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      language,
      emailNotifications,
      pushNotifications,
      bio,
      location,
      educationLevel,
      currentGrade,
      dateOfBirth,
      interests,
      primaryPersona,

      // UserMemory additions
      experience,       // Array of experience history [{company, designation, startDate, endDate, description}]
      projects,         // Array of projects [{projectName, description, role, technologies, businessImpact}]
      certifications,   // Array of certs strings or objects
      linkedin,
      github,
      website,
      languages,        // Array of languages strings
      currentSalary,
      expectedSalary,
      preferredCities,  // Array of cities strings
      preferredCountries, // Array of countries strings
      shortTerm,
      longTerm,
      educationHistory, // Array of educational degrees
    } = body;

    // 1. Update User Details
    const userUpdateData: any = {};
    if (name !== undefined) userUpdateData.name = name;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (language !== undefined) userUpdateData.language = language;
    if (primaryPersona !== undefined) userUpdateData.primaryPersona = primaryPersona;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData,
      });
    }

    // 2. Update UserProfile
    const profileUpdateData: any = {};
    if (bio !== undefined) profileUpdateData.bio = bio;
    if (location !== undefined) profileUpdateData.location = location;
    if (educationLevel !== undefined) profileUpdateData.educationLevel = educationLevel;
    if (currentGrade !== undefined) profileUpdateData.currentGrade = currentGrade;
    if (dateOfBirth !== undefined) {
      profileUpdateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (interests !== undefined) profileUpdateData.interests = interests;

    if (emailNotifications !== undefined || pushNotifications !== undefined) {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });
      const currentPreferences = (profile?.preferences as Record<string, any>) || {};
      profileUpdateData.preferences = {
        ...currentPreferences,
        ...(emailNotifications !== undefined ? { emailNotifications } : {}),
        ...(pushNotifications !== undefined ? { pushNotifications } : {}),
      };
    }

    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          bio: bio || null,
          location: location || null,
          educationLevel: educationLevel || null,
          currentGrade: currentGrade || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          interests: interests || [],
          preferences: profileUpdateData.preferences || {},
        },
        update: profileUpdateData,
      });
    }

    // 3. Update UserMemory JSON structures
    const memory = await prisma.userMemory.findUnique({
      where: { userId: session.user.id },
    });

    if (memory) {
      const demographics = (memory.demographics as Record<string, any>) || {};
      if (location !== undefined) demographics.location = location;
      if (name !== undefined) demographics.name = name;
      if (phone !== undefined) demographics.phone = phone;
      if (experience !== undefined) demographics.experience = experience;
      if (projects !== undefined) demographics.projects = projects;
      if (certifications !== undefined) demographics.certifications = certifications;
      if (linkedin !== undefined) demographics.linkedin = linkedin;
      if (github !== undefined) demographics.github = github;
      if (website !== undefined) demographics.website = website;
      if (languages !== undefined) demographics.languages = languages;

      const education = (memory.education as Record<string, any>) || {};
      if (educationLevel !== undefined) education.level = educationLevel;
      if (educationHistory !== undefined) education.history = educationHistory;

      const goals = (memory.goals as Record<string, any>) || {};
      if (shortTerm !== undefined) goals.shortTerm = shortTerm;
      if (longTerm !== undefined) goals.longTerm = longTerm;
      if (currentSalary !== undefined) goals.currentSalary = currentSalary;
      if (expectedSalary !== undefined) goals.expectedSalary = expectedSalary;
      if (preferredCities !== undefined) goals.preferredCities = preferredCities;
      if (preferredCountries !== undefined) goals.preferredCountries = preferredCountries;

      await prisma.userMemory.update({
        where: { id: memory.id },
        data: {
          demographics,
          education,
          goals,
        },
      });
    }

    // 4. Recalculate scores & sync twin
    await recalculateScores(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to update profile" } },
      { status: 500 },
    );
  }
}
