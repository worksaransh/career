import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface Q {
  text: string; textHi?: string; type: string; options: unknown[];
  category: string; subcategory?: string; difficulty: string;
  weight: number; contextTrigger?: string; memoryKey?: string;
}

const AGREE = [
  { id: "sa", text: "Strongly Agree", value: 5 },
  { id: "a", text: "Agree", value: 4 },
  { id: "n", text: "Neutral", value: 3 },
  { id: "d", text: "Disagree", value: 2 },
  { id: "sd", text: "Strongly Disagree", value: 1 },
];
const YES_NO = [
  { id: "yes", text: "Yes", value: 1 },
  { id: "no", text: "No", value: 0 },
];
const SLIDER = [{ id: "slider", text: "Rate 1-10", type: "slider", min: 1, max: 10 }];
const SWIPE = [{ id: "like", text: "Like", value: 1 }, { id: "skip", text: "Skip", value: 0 }];

const questions: Q[] = [
  // ── Coding (200 questions) ──
  ...Array.from({ length: 200 }, (_, i) => ({
    text: [
      "How comfortable are you debugging code?",
      "Do you enjoy solving algorithmic challenges?",
      "Have you built a web application from scratch?",
      "Can you explain the difference between TCP and UDP?",
      "Do you understand database indexing?",
      "Have you worked with REST APIs?",
      "Can you write SQL joins confidently?",
      "Do you know what Big O notation represents?",
      "Have you deployed an application to production?",
      "Do you use version control regularly?",
      "Can you explain object-oriented programming concepts?",
      "Have you written unit tests?",
      "Do you understand CI/CD pipelines?",
      "Can you work with asynchronous programming?",
      "Have you used Docker containers?",
      "Do you understand cloud computing basics?",
      "Can you implement basic data structures?",
      "Have you worked with NoSQL databases?",
      "Do you know how HTTP/HTTPS works?",
      "Can you read and modify existing codebases?",
    ][i % 20],
    type: i % 5 === 0 ? "AGREE_DISAGREE" : i % 5 === 1 ? "YES_NO" : i % 5 === 2 ? "SLIDER" : i % 5 === 3 ? "MCQ" : "FREE_TEXT",
    options: i % 5 === 0 ? AGREE : i % 5 === 1 ? YES_NO : i % 5 === 2 ? SLIDER : i % 5 === 3
      ? [{ id: "a", text: "Very comfortable", value: 5 }, { id: "b", text: "Somewhat", value: 3 }, { id: "c", text: "Not yet", value: 1 }]
      : [],
    category: "Coding", subcategory: ["Web Dev", "Algorithms", "Databases", "DevOps", "Languages"][i % 5],
    difficulty: i % 3 === 0 ? "EASY" : i % 3 === 1 ? "MEDIUM" : "HARD",
    weight: 0.6, memoryKey: "skills.coding",
  })),
  // ── AI (200 questions) ──
  ...Array.from({ length: 200 }, (_, i) => ({
    text: [
      "How familiar are you with machine learning concepts?",
      "Have you used any AI tools like ChatGPT or Claude?",
      "Do you understand the difference between supervised and unsupervised learning?",
      "Have you trained a machine learning model?",
      "Can you explain neural networks?",
      "Do you know what natural language processing is?",
      "Have you worked with recommendation systems?",
      "Do you understand bias in AI models?",
      "Have you used any AI APIs?",
      "Can you explain the concept of embeddings?",
      "Do you know what reinforcement learning is?",
      "Have you worked with computer vision?",
      "Do you understand prompt engineering?",
      "Can you evaluate model performance metrics?",
      "Have you used TensorFlow or PyTorch?",
      "Do you know what transfer learning is?",
      "Have you built a chatbot?",
      "Do you understand AI ethics concerns?",
      "Can you explain what LLMs are?",
      "Have you done any data preprocessing work?",
    ][i % 20],
    type: i % 5 === 0 ? "AGREE_DISAGREE" : i % 5 === 1 ? "MCQ" : i % 5 === 2 ? "YES_NO" : i % 5 === 3 ? "SLIDER" : "FREE_TEXT",
    options: i % 5 === 0 ? AGREE : i % 5 === 1
      ? [{ id: "a", text: "Expert", value: 5 }, { id: "b", text: "Intermediate", value: 3 }, { id: "c", text: "Beginner", value: 1 }, { id: "d", text: "No experience", value: 0 }]
      : i % 5 === 2 ? YES_NO : SLIDER,
    category: "AI", subcategory: ["ML", "NLP", "Computer Vision", "Ethics", "Tools"][i % 5],
    difficulty: i % 3 === 0 ? "EASY" : i % 3 === 1 ? "MEDIUM" : "HARD",
    weight: 0.7, memoryKey: "skills.ai",
  })),
  // ── Sports (150 questions) ──
  ...Array.from({ length: 150 }, (_, i) => ({
    text: [
      "Do you follow any sports regularly?",
      "Have you played team sports?",
      "How important is physical fitness to you?",
      "Do you enjoy watching live sports events?",
      "Have you ever competed in a tournament?",
      "Do you prefer individual or team sports?",
      "How many hours a week do you exercise?",
      "Do you follow any sports leagues?",
      "Have you coached or mentored in sports?",
      "Do you think sports build leadership skills?",
    ][i % 10],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "YES_NO" : i % 4 === 2 ? "SLIDER" : "MCQ",
    options: i % 4 === 0 ? AGREE : i % 4 === 1 ? YES_NO : i % 4 === 2 ? SLIDER
      : [{ id: "a", text: "Daily", value: 5 }, { id: "b", text: "Weekly", value: 3 }, { id: "c", text: "Rarely", value: 1 }, { id: "d", text: "Never", value: 0 }],
    category: "Sports", subcategory: ["Team Sports", "Individual", "Fitness", "Esports", "Outdoor"][i % 5],
    difficulty: "EASY", weight: 0.3, memoryKey: "lifestyleSignals.sports",
  })),
  // ── Gaming (150 questions) ──
  ...Array.from({ length: 150 }, (_, i) => ({
    text: [
      "Do you play video games?",
      "What type of games do you prefer?",
      "How many hours per week do you game?",
      "Do you play competitively or casually?",
      "Have you considered a career in gaming?",
      "Do you follow gaming news and trends?",
      "Have you modded or customized games?",
      "Do you play multiplayer or single-player?",
      "Have you attended gaming events?",
      "Do you think gaming develops useful skills?",
    ][i % 10],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "MCQ" : i % 4 === 2 ? "YES_NO" : "SLIDER",
    options: i % 4 === 0 ? AGREE : i % 4 === 1
      ? [{ id: "a", text: "Strategy", value: 1 }, { id: "b", text: "Action", value: 2 }, { id: "c", text: "RPG", value: 3 }, { id: "d", text: "Sports", value: 4 }, { id: "e", text: "Puzzle", value: 5 }]
      : i % 4 === 2 ? YES_NO : SLIDER,
    category: "Gaming", subcategory: ["Console", "PC", "Mobile", "Esports", "Casual"][i % 5],
    difficulty: "EASY", weight: 0.3, memoryKey: "lifestyleSignals.gaming",
  })),
  // ── Movies (150 questions) ──
  ...Array.from({ length: 150 }, (_, i) => ({
    text: [
      "What genre of movies do you enjoy most?",
      "How often do you watch movies?",
      "Do you prefer movies or web series?",
      "Have you ever analyzed a film critically?",
      "Do you follow specific directors or actors?",
      "Would you be interested in film-making?",
      "Do you enjoy discussing movies with others?",
      "Have you written reviews or critiques?",
      "Do you think movies influence culture?",
      "What language films do you primarily watch?",
    ][i % 10],
    type: i % 3 === 0 ? "MCQ" : i % 3 === 1 ? "AGREE_DISAGREE" : "YES_NO",
    options: i % 3 === 0
      ? [{ id: "a", text: "Action/Thriller", value: 1 }, { id: "b", text: "Comedy", value: 2 }, { id: "c", text: "Drama", value: 3 }, { id: "d", text: "Sci-Fi", value: 4 }, { id: "e", text: "Documentary", value: 5 }]
      : i % 3 === 1 ? AGREE : YES_NO,
    category: "Movies", subcategory: ["Bollywood", "Hollywood", "Regional", "Documentary", "Independent"][i % 5],
    difficulty: "EASY", weight: 0.2, memoryKey: "lifestyleSignals.movies",
  })),
  // ── Books (150 questions) ──
  ...Array.from({ length: 150 }, (_, i) => ({
    text: [
      "How many books do you read per year?",
      "What genre of books do you prefer?",
      "Do you prefer physical books or e-books?",
      "Have you read any non-fiction this year?",
      "Do you follow any authors regularly?",
      "Have you written any creative writing?",
      "Do you read for learning or entertainment?",
      "Have you joined a book club?",
      "Do you think reading improves career prospects?",
      "What was the last book you read?",
    ][i % 10],
    type: i % 4 === 0 ? "SLIDER" : i % 4 === 1 ? "MCQ" : i % 4 === 2 ? "AGREE_DISAGREE" : "FREE_TEXT",
    options: i % 4 === 0 ? SLIDER : i % 4 === 1
      ? [{ id: "a", text: "Fiction", value: 1 }, { id: "b", text: "Non-Fiction", value: 2 }, { id: "c", text: "Self-Help", value: 3 }, { id: "d", text: "Technical", value: 4 }, { id: "e", text: "Biography", value: 5 }]
      : i % 4 === 2 ? AGREE : [],
    category: "Books", subcategory: ["Fiction", "Non-Fiction", "Technical", "Self-Help", "Academic"][i % 5],
    difficulty: "EASY", weight: 0.3, memoryKey: "lifestyleSignals.reading",
  })),
  // ── Finance (200 questions — expand existing) ──
  ...Array.from({ length: 200 }, (_, i) => ({
    text: [
      "Do you create and follow a monthly budget?",
      "How confident are you in investment decisions?",
      "Have you invested in stocks or mutual funds?",
      "Do you have an emergency fund?",
      "How important is financial independence to you?",
      "Do you understand compound interest?",
      "Have you filed your own taxes?",
      "Do you track your net worth?",
      "Are you saving for retirement?",
      "Do you understand inflation's impact on savings?",
      "Have you taken any financial education courses?",
      "Do you use budgeting apps or tools?",
      "How much of your income do you save?",
      "Do you have any debt management strategy?",
      "Have you considered passive income streams?",
      "Do you understand risk diversification?",
      "Have you used credit cards responsibly?",
      "Do you negotiate your salary?",
      "Are you aware of your credit score?",
      "Do you set financial goals annually?",
    ][i % 20],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "YES_NO" : i % 4 === 2 ? "SLIDER" : "MCQ",
    options: i % 4 === 0 ? AGREE : i % 4 === 1 ? YES_NO : i % 4 === 2 ? SLIDER
      : [{ id: "a", text: "Very confident", value: 5 }, { id: "b", text: "Somewhat", value: 3 }, { id: "c", text: "Learning", value: 2 }, { id: "d", text: "Not confident", value: 1 }],
    category: "Finance", subcategory: ["Budgeting", "Investing", "Saving", "Tax", "Retirement"][i % 5],
    difficulty: i % 3 === 0 ? "EASY" : i % 3 === 1 ? "MEDIUM" : "HARD",
    weight: 0.7, memoryKey: "budget.financialLiteracy",
  })),
  // ── Business (200 questions) ──
  ...Array.from({ length: 200 }, (_, i) => ({
    text: [
      "Do you understand business models?",
      "Have you ever run a business or side hustle?",
      "Can you read a balance sheet?",
      "Do you understand supply chain basics?",
      "Have you created a business plan?",
      "Do you know what unit economics means?",
      "Have you done market research?",
      "Do you understand pricing strategies?",
      "Have you negotiated business deals?",
      "Do you know what a competitive moat is?",
      "Have you managed a budget at work?",
      "Do you understand customer acquisition cost?",
      "Have you presented to executives?",
      "Do you follow business news?",
      "Have you worked with KPIs and metrics?",
      "Do you understand revenue models?",
      "Have you done SWOT analysis?",
      "Do you know what a pitch deck is?",
      "Have you managed stakeholders?",
      "Do you think you could start a company?",
    ][i % 20],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "YES_NO" : i % 4 === 2 ? "MCQ" : "FREE_TEXT",
    options: i % 4 === 0 ? AGREE : i % 4 === 1 ? YES_NO : i % 4 === 2
      ? [{ id: "a", text: "Expert", value: 5 }, { id: "b", text: "Working knowledge", value: 3 }, { id: "c", text: "Basic understanding", value: 2 }, { id: "d", text: "No knowledge", value: 0 }]
      : [],
    category: "Business", subcategory: ["Strategy", "Operations", "Marketing", "Finance", "Entrepreneurship"][i % 5],
    difficulty: i % 3 === 0 ? "EASY" : i % 3 === 1 ? "MEDIUM" : "HARD",
    weight: 0.6, memoryKey: "skills.business",
  })),
  // ── Risk (100 questions) ──
  ...Array.from({ length: 100 }, (_, i) => ({
    text: [
      "How comfortable are you with taking risks?",
      "Have you ever made a decision with uncertain outcomes?",
      "Do you weigh pros and cons before decisions?",
      "Have you taken a calculated risk that paid off?",
      "How do you handle failure?",
      "Do you prefer stable income or variable high income?",
      "Would you start a business with 50% failure rate?",
      "Have you invested in high-risk assets?",
      "Do you have a backup plan for your career?",
      "How do you evaluate risk in decisions?",
    ][i % 10],
    type: i % 3 === 0 ? "AGREE_DISAGREE" : i % 3 === 1 ? "SLIDER" : "MCQ",
    options: i % 3 === 0 ? AGREE : i % 3 === 1 ? SLIDER
      : [{ id: "a", text: "Very risk-tolerant", value: 5 }, { id: "b", text: "Moderate", value: 3 }, { id: "c", text: "Risk-averse", value: 1 }],
    category: "Risk", subcategory: ["Financial", "Career", "Personal", "Business", "Social"][i % 5],
    difficulty: "MEDIUM", weight: 0.5, memoryKey: "personality.riskTolerance",
  })),
  // ── Entrepreneurship (150 questions) ──
  ...Array.from({ length: 150 }, (_, i) => ({
    text: [
      "Have you ever wanted to start your own business?",
      "Do you have a business idea you're passionate about?",
      "How important is autonomy in your work?",
      "Have you sold anything online?",
      "Do you network with other entrepreneurs?",
      "Can you handle uncertainty in income?",
      "Have you raised funds for a project?",
      "Do you enjoy building things from scratch?",
      "Have you led a team or project?",
      "Do you follow startup news and trends?",
      "Have you participated in a hackathon?",
      "Do you have mentors in business?",
      "Are you comfortable with public speaking?",
      "Have you created a digital product?",
      "Do you understand intellectual property?",
    ][i % 15],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "YES_NO" : i % 4 === 2 ? "MCQ" : "FREE_TEXT",
    options: i % 4 === 0 ? AGREE : i % 4 === 1 ? YES_NO : i % 4 === 2
      ? [{ id: "a", text: "Already doing it", value: 5 }, { id: "b", text: "Planning to", value: 3 }, { id: "c", text: "Interested", value: 2 }, { id: "d", text: "Not interested", value: 0 }]
      : [],
    category: "Entrepreneurship", subcategory: ["Ideation", "Funding", "Growth", "Product", "Sales"][i % 5],
    difficulty: "MEDIUM", weight: 0.6, memoryKey: "goals.entrepreneurship",
  })),
  // ── Mental Models (100 questions) ──
  ...Array.from({ length: 100 }, (_, i) => ({
    text: [
      "Do you use first principles thinking?",
      "How often do you reflect on your thinking process?",
      "Do you consider second-order effects of decisions?",
      "Have you heard of Occam's Razor?",
      "Do you actively seek opposing viewpoints?",
      "How do you approach complex problems?",
      "Do you use mental frameworks for decisions?",
      "Have you studied logical fallacies?",
      "Do you practice probabilistic thinking?",
      "How often do you change your mind based on evidence?",
    ][i % 10],
    type: i % 3 === 0 ? "AGREE_DISAGREE" : i % 3 === 1 ? "MCQ" : "FREE_TEXT",
    options: i % 3 === 0 ? AGREE : i % 3 === 1
      ? [{ id: "a", text: "Always", value: 5 }, { id: "b", text: "Often", value: 4 }, { id: "c", text: "Sometimes", value: 2 }, { id: "d", text: "Never", value: 0 }]
      : [],
    category: "Mental Models", subcategory: ["Thinking", "Decision Making", "Problem Solving", "Bias", "Logic"][i % 5],
    difficulty: "HARD", weight: 0.5, memoryKey: "personality.mentalModels",
  })),
  // ── Productivity (150 questions) ──
  ...Array.from({ length: 150 }, (_, i) => ({
    text: [
      "Do you use a task management system?",
      "How many hours per day are you productive?",
      "Do you struggle with procrastination?",
      "Have you tried time-blocking?",
      "Do you set daily goals?",
      "How do you handle distractions?",
      "Do you use the Pomodoro technique?",
      "Do you batch similar tasks together?",
      "How do you prioritize your work?",
      "Do you review your week's productivity?",
      "Do you take regular breaks?",
      "Have you tried productivity apps?",
      "Do you plan your week in advance?",
      "How do you manage email overload?",
      "Do you delegate tasks effectively?",
    ][i % 15],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "SLIDER" : i % 4 === 2 ? "YES_NO" : "MCQ",
    options: i % 4 === 0 ? AGREE : i % 4 === 1 ? SLIDER : i % 4 === 2 ? YES_NO
      : [{ id: "a", text: "Very organized", value: 5 }, { id: "b", text: "Somewhat", value: 3 }, { id: "c", text: "Could improve", value: 1 }, { id: "d", text: "Not organized", value: 0 }],
    category: "Productivity", subcategory: ["Time Management", "Focus", "Systems", "Habits", "Tools"][i % 5],
    difficulty: "EASY", weight: 0.4, memoryKey: "behaviorSignals.productivity",
  })),
  // ── Communication (100 questions — expand existing) ──
  ...Array.from({ length: 100 }, (_, i) => ({
    text: [
      "How comfortable are you with public speaking?",
      "Do you express your ideas clearly in writing?",
      "How do you handle difficult conversations?",
      "Do you actively listen during discussions?",
      "Have you presented to large audiences?",
      "Do you adapt your communication style to different audiences?",
      "How do you give constructive feedback?",
      "Do you participate actively in meetings?",
      "Have you written professional reports or documents?",
      "Do you negotiate effectively?",
    ][i % 10],
    type: i % 4 === 0 ? "AGREE_DISAGREE" : i % 4 === 1 ? "SLIDER" : i % 4 === 2 ? "MCQ" : "FREE_TEXT",
    options: i % 4 === 0 ? AGREE : i % 4 === 1 ? SLIDER : i % 4 === 2
      ? [{ id: "a", text: "Excellent", value: 5 }, { id: "b", text: "Good", value: 4 }, { id: "c", text: "Average", value: 2 }, { id: "d", text: "Needs improvement", value: 1 }]
      : [],
    category: "Communication", subcategory: ["Verbal", "Written", "Presentation", "Negotiation", "Listening"][i % 5],
    difficulty: "MEDIUM", weight: 0.5, memoryKey: "skills.communication",
  })),
];

async function main() {
  const existing = await prisma.adaptiveQuestion.count();
  console.log(`Existing questions: ${existing}`);

  // Check for duplicates by text
  const existingTexts = new Set(
    (await prisma.adaptiveQuestion.findMany({ select: { text: true } })).map(q => q.text.toLowerCase())
  );

  let count = 0;
  for (const q of questions) {
    if (existingTexts.has(q.text.toLowerCase())) continue;
    try {
      await prisma.adaptiveQuestion.create({
        data: {
          text: q.text,
          textHi: q.textHi || null,
          type: q.type,
          options: q.options,
          category: q.category,
          subcategory: q.subcategory || null,
          difficulty: q.difficulty,
          weight: q.weight,
          contextTrigger: q.contextTrigger || null,
          memoryKey: q.memoryKey || null,
          isActive: true,
        },
      });
      count++;
      existingTexts.add(q.text.toLowerCase());
    } catch { /* skip duplicate */ }
  }
  console.log(`Created ${count} new questions`);
  const total = await prisma.adaptiveQuestion.count();
  console.log(`Total questions: ${total}`);

  const cats = await prisma.adaptiveQuestion.groupBy({ by: ["category"], _count: true });
  for (const c of cats) console.log(`  ${c.category}: ${c._count}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
