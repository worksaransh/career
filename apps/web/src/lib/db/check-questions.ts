import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  console.log("AdaptiveQuestions:", await p.adaptiveQuestion.count());
  const cats = await p.adaptiveQuestion.groupBy({ by: ["category"], _count: true });
  for (const c of cats) console.log(" ", c.category, c._count);
  await p.$disconnect();
})();
