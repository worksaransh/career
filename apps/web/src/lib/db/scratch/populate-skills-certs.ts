import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== POPULATING SKILLS & CERTIFICATIONS IN BULK ===");
  try {
    const careers = await prisma.career.findMany({
      select: {
        title: true,
        requiredSkills: true,
        certifications: true,
      }
    });

    console.log(`Analyzing ${careers.length} careers for skills & certifications...`);

    const skillsMap = new Map<string, { category: string; careers: string[] }>();
    const certsMap = new Map<string, { careers: string[] }>();

    careers.forEach(c => {
      // Analyze skills
      c.requiredSkills.forEach(skillName => {
        const cleaned = skillName.trim();
        if (!cleaned) return;
        const key = cleaned.toLowerCase();
        
        let category = "Technical";
        if (["communication", "leadership", "agile", "agile methodology", "scrum", "management", "public speaking", "empathy", "problem solving"].some(s => key.includes(s))) {
          category = "Leadership";
        } else if (["design", "art", "typography", "figma", "sketch", "photoshop", "creative"].some(s => key.includes(s))) {
          category = "Creative";
        } else if (["statistics", "math", "analysis", "analytics", "excel", "financial", "economics"].some(s => key.includes(s))) {
          category = "Analytical";
        } else if (["mentoring", "patient care", "nursing", "teaching", "counseling"].some(s => key.includes(s))) {
          category = "Social";
        }

        const existing = skillsMap.get(key);
        if (existing) {
          if (!existing.careers.includes(c.title)) {
            existing.careers.push(c.title);
          }
        } else {
          skillsMap.set(key, { category, careers: [c.title] });
        }
      });

      // Analyze certifications
      c.certifications.forEach(certName => {
        const cleaned = certName.trim();
        if (!cleaned) return;
        const key = cleaned.toLowerCase();
        const existing = certsMap.get(key);
        if (existing) {
          if (!existing.careers.includes(c.title)) {
            existing.careers.push(c.title);
          }
        } else {
          certsMap.set(key, { careers: [c.title] });
        }
      });
    });

    console.log(`Found ${skillsMap.size} unique skills and ${certsMap.size} unique certifications.`);

    // 1. Seed Skills in bulk
    const skillsData = Array.from(skillsMap.entries()).map(([rawName, info]) => {
      const name = rawName.replace(/\b\w/g, c => c.toUpperCase());
      const description = `Essential skills in ${info.category} domain. Required for careers like: ${info.careers.slice(0, 3).join(", ")}.`;
      return {
        name,
        category: info.category,
        description,
        difficulty: "MEDIUM",
        demand: info.careers.length > 5 ? "HIGH" : "MEDIUM"
      };
    });

    console.log(`Inserting ${skillsData.length} skills in bulk...`);
    const skillsResult = await prisma.skill.createMany({
      data: skillsData,
      skipDuplicates: true
    });
    console.log(`Bulk inserted skills count: ${skillsResult.count}`);

    // 2. Seed Certifications in bulk
    const certsData = Array.from(certsMap.entries()).map(([rawName, info]) => {
      const name = rawName.replace(/\b\w/g, c => c.toUpperCase());
      let provider = "Industry Standard";
      if (name.toLowerCase().includes("google")) provider = "Google";
      else if (name.toLowerCase().includes("aws") || name.toLowerCase().includes("amazon")) provider = "AWS";
      else if (name.toLowerCase().includes("microsoft") || name.toLowerCase().includes("azure")) provider = "Microsoft";
      else if (name.toLowerCase().includes("meta") || name.toLowerCase().includes("facebook")) provider = "Meta";
      else if (name.toLowerCase().includes("cisco") || name.toLowerCase().includes("ccna")) provider = "Cisco";
      else if (name.toLowerCase().includes("pmi") || name.toLowerCase().includes("pmp")) provider = "PMI";
      else if (name.toLowerCase().includes("oracle") || name.toLowerCase().includes("java")) provider = "Oracle";
      else if (name.toLowerCase().includes("adobe")) provider = "Adobe";

      const cost = 10000 + Math.floor(Math.random() * 20000); // INR cost
      const duration = "3-6 Months";

      return {
        name,
        provider,
        cost,
        duration,
        skillsCovered: info.careers.slice(0, 5),
        affiliateLink: `https://www.coursera.org/search?query=${encodeURIComponent(name)}`
      };
    });

    console.log(`Inserting ${certsData.length} certifications in bulk...`);
    const certsResult = await prisma.certification.createMany({
      data: certsData,
      skipDuplicates: true
    });
    console.log(`Bulk inserted certifications count: ${certsResult.count}`);

    console.log("Bulk seeding completed successfully!");
  } catch (err) {
    console.error("Error populating skills & certifications in bulk:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
