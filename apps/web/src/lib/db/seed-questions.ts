import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Load env
try {
  const possiblePaths = [
    path.resolve(__dirname, "../../../../../.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ];
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf-8");
      envConfig.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2) {
          const key = parts[0]?.trim();
          const value = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
          if (key && !key.startsWith("#")) process.env[key] = value;
        }
      });
      break;
    }
  }
} catch (_e) { /* silent */ }

const prisma = new PrismaClient();

interface QuestionSeed {
  text: string;
  textHi?: string;
  textHinglish?: string;
  type: string;
  options: unknown[];
  category: string;
  subcategory?: string;
  difficulty: string;
  weight: number;
  contextTrigger?: string;
  memoryKey?: string;
}

const AGREE_OPTIONS = [
  { id: "sa", text: "Strongly Agree", value: 5 },
  { id: "a", text: "Agree", value: 4 },
  { id: "n", text: "Neutral", value: 3 },
  { id: "d", text: "Disagree", value: 2 },
  { id: "sd", text: "Strongly Disagree", value: 1 },
];

const YES_NO_OPTIONS = [
  { id: "y", text: "Yes", value: 1 },
  { id: "n", text: "No", value: 0 },
];

const QUESTIONS: QuestionSeed[] = [
  // ─── Analytical (30) ─────────────────────────────────────────
  { text: "I enjoy solving complex problems using logic and analysis.", textHi: "मुझे तर्क और विश्लेषण का उपयोग करके जटिल समस्याओं को हल करने में आनंद आता है।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.9, memoryKey: "interests" },
  { text: "I like working with data and numbers to find patterns.", textHi: "मुझे डेटा और नंबरों के साथ काम करके पैटर्न खोजने में मज़ा आता है।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.85 },
  { text: "I prefer structured approaches over intuitive guessing.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.7 },
  { text: "I enjoy puzzles, brain teasers, and strategy games.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Problem-Solving", difficulty: "EASY", weight: 0.8, memoryKey: "personality.analytical" },
  { text: "I find it satisfying to debug errors and troubleshoot issues.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Debugging", difficulty: "MEDIUM", weight: 0.75, contextTrigger: "page:skills" },
  { text: "I enjoy learning new mathematical concepts.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Mathematics", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I prefer evidence-based decisions over gut feelings.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.65 },
  { text: "I enjoy reading research papers and technical documentation.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Research", difficulty: "MEDIUM", weight: 0.6 },
  { text: "I can spend hours analyzing a problem without getting bored.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.75 },
  { text: "I enjoy creating charts, graphs, and visualizations from data.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Data Visualization", difficulty: "MEDIUM", weight: 0.7, contextTrigger: "page:skills" },
  { text: "I like to compare and evaluate multiple options before deciding.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.6 },
  { text: "I enjoy working with spreadsheets and organizing information.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Organization", difficulty: "EASY", weight: 0.65 },
  { text: "I am good at identifying logical fallacies and weak arguments.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Critical Thinking", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I find statistics and probability fascinating.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Statistics", difficulty: "MEDIUM", weight: 0.65 },
  { text: "Have you ever used Excel, Google Sheets, or SQL?", textHi: "क्या आपने कभी Excel, Google Sheets, या SQL का उपयोग किया है?", type: "MCQ", options: [{ id: "expert", text: "Yes, regularly", value: 3 }, { id: "some", text: "A few times", value: 2 }, { id: "no", text: "Never", value: 0 }], category: "Analytical", subcategory: "Tools", difficulty: "EASY", weight: 0.8, contextTrigger: "page:skills", memoryKey: "skills" },
  { text: "I am comfortable interpreting scientific graphs and charts.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I enjoy financial analysis and understanding market trends.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Finance", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I like breaking complex systems into smaller components.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Systems Thinking", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I am good at estimating quantities and making quick calculations.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.5 },
  { text: "I enjoy optimization — finding the best solution from many options.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Optimization", difficulty: "MEDIUM", weight: 0.75 },
  { text: "How would you rate your comfort level with numbers and data?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Comfort Level" }], category: "Analytical", difficulty: "EASY", weight: 0.8, memoryKey: "personality.dataComfort" },
  { text: "I enjoy designing experiments to test hypotheses.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Research", difficulty: "HARD", weight: 0.6 },
  { text: "I am fascinated by how algorithms and AI systems work.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "AI", difficulty: "MEDIUM", weight: 0.85, contextTrigger: "page:careers" },
  { text: "I enjoy quality assurance and testing processes.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "QA", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I like to verify facts before sharing information.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.5 },
  { text: "I enjoy reading about scientific discoveries and breakthroughs.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Science", difficulty: "EASY", weight: 0.6 },
  { text: "I find it easy to identify root causes of recurring problems.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Root Cause Analysis", difficulty: "HARD", weight: 0.7 },
  { text: "I enjoy creating automated workflows and processes.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Automation", difficulty: "HARD", weight: 0.75, contextTrigger: "page:skills" },
  { text: "I like planning and scheduling activities in advance.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", subcategory: "Planning", difficulty: "EASY", weight: 0.55 },
  { text: "I enjoy competitive quizzes and knowledge challenges.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Analytical", difficulty: "EASY", weight: 0.5 },

  // ─── Creative (25) ───────────────────────────────────────────
  { text: "I enjoy expressing myself through art, music, or writing.", textHi: "मुझे कला, संगीत, या लेखन के माध्यम से खुद को व्यक्त करने में आनंद आता है।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.9, memoryKey: "interests" },
  { text: "I often come up with unique ideas that others find surprising.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.8 },
  { text: "I enjoy designing interfaces, layouts, or visual presentations.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Design", difficulty: "EASY", weight: 0.85, contextTrigger: "page:skills" },
  { text: "I appreciate good aesthetics and pay attention to visual details.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Aesthetics", difficulty: "EASY", weight: 0.7 },
  { text: "I enjoy storytelling and creating compelling narratives.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Writing", difficulty: "EASY", weight: 0.75 },
  { text: "I like brainstorming sessions where no idea is wrong.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.65 },
  { text: "I enjoy photography, videography, or visual content creation.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Media", difficulty: "EASY", weight: 0.7 },
  { text: "I often think about how products could be designed better.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Product Design", difficulty: "MEDIUM", weight: 0.75 },
  { text: "I enjoy improvising and creating things without a strict plan.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.6 },
  { text: "I would enjoy a job where I create new things every day.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.85, memoryKey: "personality.creative" },
  { text: "I enjoy interior design, architecture, or spatial planning.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Spatial Design", difficulty: "MEDIUM", weight: 0.6 },
  { text: "I find it easy to think in metaphors and abstract concepts.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I enjoy experimenting with colors, textures, and materials.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Visual Art", difficulty: "EASY", weight: 0.6 },
  { text: "I enjoy creating social media content and marketing materials.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Content Marketing", difficulty: "EASY", weight: 0.75 },
  { text: "Which creative activities do you enjoy most?", type: "MULTI_SELECT", options: [{ id: "drawing", text: "Drawing / Painting" }, { id: "writing", text: "Writing / Blogging" }, { id: "music", text: "Music / Audio" }, { id: "video", text: "Video / Film" }, { id: "design", text: "Graphic Design" }, { id: "coding", text: "Creative Coding" }, { id: "none", text: "None of these" }], category: "Creative", difficulty: "EASY", weight: 0.85, memoryKey: "lifestyle.creativeActivities" },
  { text: "I enjoy learning about typography, branding, and visual identity.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Branding", difficulty: "MEDIUM", weight: 0.6 },
  { text: "I can easily visualize how something will look before it exists.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Visualization", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I enjoy creating presentations that captivate an audience.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.55 },
  { text: "I like combining different art forms to create something new.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", difficulty: "MEDIUM", weight: 0.5 },
  { text: "I enjoy game design and creating interactive experiences.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Game Design", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I find it exciting to learn new creative tools and software.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Tools", difficulty: "EASY", weight: 0.6 },
  { text: "I enjoy crafting unique user experiences for websites and apps.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "UX Design", difficulty: "MEDIUM", weight: 0.8, contextTrigger: "page:skills" },
  { text: "I like to doodle, sketch, or draw in my free time.", type: "YES_NO", options: YES_NO_OPTIONS, category: "Creative", difficulty: "EASY", weight: 0.5, memoryKey: "lifestyle.doodling" },
  { text: "I enjoy fashion, styling, or creating outfits.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Fashion", difficulty: "EASY", weight: 0.5 },
  { text: "I enjoy solving design challenges with creative constraints.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Creative", subcategory: "Problem-Solving", difficulty: "HARD", weight: 0.65 },

  // ─── Technical (30) ──────────────────────────────────────────
  { text: "I enjoy writing code or building software.", textHi: "मुझे कोड लिखने या सॉफ़्टवेयर बनाने में मज़ा आता है।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", difficulty: "EASY", weight: 0.95, contextTrigger: "page:skills", memoryKey: "interests" },
  { text: "I am curious about how computers and networks function.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Networking", difficulty: "EASY", weight: 0.8 },
  { text: "I enjoy building or repairing electronic devices.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Hardware", difficulty: "EASY", weight: 0.7 },
  { text: "Would you enjoy building software every day as a career?", textHi: "क्या आप करियर के रूप में हर दिन सॉफ़्टवेयर बनाने का आनंद लेंगे?", type: "MCQ", options: [{ id: "love", text: "Absolutely love it", value: 5 }, { id: "like", text: "Would enjoy it", value: 3 }, { id: "maybe", text: "Maybe", value: 2 }, { id: "no", text: "Probably not", value: 0 }], category: "Technical", difficulty: "EASY", weight: 0.9, contextTrigger: "page:careers", memoryKey: "personality.codingCareer" },
  { text: "Which programming languages have you used or studied?", type: "MULTI_SELECT", options: [{ id: "python", text: "Python" }, { id: "javascript", text: "JavaScript" }, { id: "java", text: "Java" }, { id: "cpp", text: "C/C++" }, { id: "html", text: "HTML/CSS" }, { id: "sql", text: "SQL" }, { id: "none", text: "None yet" }], category: "Technical", subcategory: "Programming", difficulty: "EASY", weight: 0.9, contextTrigger: "page:skills", memoryKey: "skills" },
  { text: "I enjoy learning about cybersecurity and ethical hacking.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Cybersecurity", difficulty: "MEDIUM", weight: 0.75 },
  { text: "I enjoy working with APIs, databases, and backend systems.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Backend", difficulty: "MEDIUM", weight: 0.8, contextTrigger: "page:skills" },
  { text: "I am interested in machine learning and artificial intelligence.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "AI/ML", difficulty: "MEDIUM", weight: 0.9, contextTrigger: "page:careers" },
  { text: "I enjoy setting up and managing cloud infrastructure.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "DevOps", difficulty: "HARD", weight: 0.7 },
  { text: "I like automating repetitive tasks with scripts.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Automation", difficulty: "MEDIUM", weight: 0.75 },
  { text: "I enjoy building mobile apps.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Mobile Dev", difficulty: "MEDIUM", weight: 0.75 },
  { text: "I am interested in blockchain, web3, or decentralized tech.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Web3", difficulty: "MEDIUM", weight: 0.6 },
  { text: "I enjoy version control and collaborative coding workflows.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Git", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I find robotics and IoT (Internet of Things) exciting.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Robotics", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I enjoy building websites and web applications.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Web Dev", difficulty: "EASY", weight: 0.85, contextTrigger: "page:skills" },
  { text: "How comfortable are you with coding concepts?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Coding Comfort" }], category: "Technical", difficulty: "EASY", weight: 0.85, memoryKey: "personality.codingComfort" },
  { text: "I enjoy working in the terminal / command line.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "CLI", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I am interested in data engineering and ETL pipelines.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Data Engineering", difficulty: "HARD", weight: 0.65 },
  { text: "Have you used AI tools like ChatGPT, Copilot, or Cursor for coding?", textHi: "क्या आपने कोडिंग के लिए ChatGPT, Copilot, या Cursor जैसे AI टूल्स का उपयोग किया है?", type: "MCQ", options: [{ id: "regularly", text: "Yes, regularly", value: 3 }, { id: "tried", text: "Tried a few times", value: 2 }, { id: "no", text: "Not yet", value: 0 }], category: "Technical", subcategory: "AI Tools", difficulty: "EASY", weight: 0.8, memoryKey: "skills" },
  { text: "I enjoy learning about operating systems and low-level programming.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Systems", difficulty: "HARD", weight: 0.55 },
  { text: "I am interested in vibe coding (building apps using AI prompts).", textHinglish: "Kya aapko vibe coding (AI prompts se apps banana) interesting lagta hai?", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Vibe Coding", difficulty: "EASY", weight: 0.85, contextTrigger: "page:careers" },
  { text: "I enjoy testing software and writing automated test suites.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Testing", difficulty: "MEDIUM", weight: 0.5 },
  { text: "I am interested in prompt engineering and AI tool design.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Prompt Engineering", difficulty: "MEDIUM", weight: 0.8 },
  { text: "I enjoy open-source contributions and community coding.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Open Source", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I am interested in 3D modeling, AR, or VR technologies.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "3D/AR/VR", difficulty: "MEDIUM", weight: 0.6 },
  { text: "I enjoy database design and data modeling.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Database", difficulty: "HARD", weight: 0.6 },
  { text: "I like competitive programming and coding contests.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Competitive", difficulty: "HARD", weight: 0.65 },
  { text: "I enjoy tech product reviews and staying updated on new releases.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", difficulty: "EASY", weight: 0.45 },
  { text: "I would enjoy working as a freelance developer.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Freelance", difficulty: "EASY", weight: 0.6 },
  { text: "I am interested in tech entrepreneurship and building startups.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Technical", subcategory: "Startup", difficulty: "MEDIUM", weight: 0.75, contextTrigger: "page:careers" },

  // ─── Social (25) ─────────────────────────────────────────────
  { text: "I enjoy helping others solve their problems.", textHi: "मुझे दूसरों की समस्याओं को हल करने में मदद करने में आनंद आता है।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", difficulty: "EASY", weight: 0.9, memoryKey: "interests" },
  { text: "I like working in teams and collaborating with diverse people.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", difficulty: "EASY", weight: 0.85 },
  { text: "I enjoy teaching or mentoring junior colleagues.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Teaching", difficulty: "EASY", weight: 0.8, memoryKey: "personality.teaching" },
  { text: "I am good at understanding others' emotions and motivations.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Empathy", difficulty: "EASY", weight: 0.75 },
  { text: "I enjoy networking and meeting new people professionally.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Networking", difficulty: "EASY", weight: 0.7 },
  { text: "I am comfortable speaking in front of groups.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Public Speaking", difficulty: "EASY", weight: 0.75, memoryKey: "personality.publicSpeaking" },
  { text: "I enjoy conflict resolution and mediating disagreements.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Mediation", difficulty: "MEDIUM", weight: 0.6 },
  { text: "Do you enjoy leadership and business strategy?", textHi: "क्या आप नेतृत्व और व्यापार रणनीति का आनंद लेते हैं?", type: "MCQ", options: [{ id: "love", text: "Yes, very much", value: 5 }, { id: "some", text: "Somewhat", value: 3 }, { id: "no", text: "Not really", value: 1 }], category: "Social", subcategory: "Leadership", difficulty: "EASY", weight: 0.85, contextTrigger: "page:careers", memoryKey: "personality.leadership" },
  { text: "I prefer working with people over working with machines.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", difficulty: "EASY", weight: 0.65 },
  { text: "I enjoy volunteering and community service.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Volunteering", difficulty: "EASY", weight: 0.55, memoryKey: "lifestyle.volunteering" },
  { text: "I am good at persuading others and presenting arguments.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Persuasion", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I enjoy working in customer-facing roles.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Customer Service", difficulty: "EASY", weight: 0.55 },
  { text: "I enjoy organizing events, workshops, or meetups.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Events", difficulty: "EASY", weight: 0.6 },
  { text: "I would enjoy a career in counseling or psychology.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Counseling", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I enjoy writing emails and professional communication.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Communication", difficulty: "EASY", weight: 0.5 },
  { text: "I enjoy cross-cultural interactions and learning about different societies.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Cultural", difficulty: "EASY", weight: 0.5 },
  { text: "Do you prefer working solo or in a team?", type: "MCQ", options: [{ id: "team", text: "Strongly prefer teams", value: 5 }, { id: "both", text: "Comfortable with both", value: 3 }, { id: "solo", text: "Prefer working solo", value: 1 }], category: "Social", difficulty: "EASY", weight: 0.8, memoryKey: "personality.teamPreference" },
  { text: "I enjoy social media management and community building.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Social Media", difficulty: "EASY", weight: 0.6 },
  { text: "I enjoy negotiation and deal-making.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Negotiation", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I enjoy HR and people management work.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "HR", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I enjoy motivating others to achieve their goals.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", difficulty: "EASY", weight: 0.6 },
  { text: "I enjoy building communities around shared interests.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Community", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I enjoy relationship management and stakeholder communication.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Relationships", difficulty: "HARD", weight: 0.55 },
  { text: "I am interested in politics, governance, or policy-making.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Policy", difficulty: "MEDIUM", weight: 0.5 },
  { text: "I enjoy debating and discussing ideas with others.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Social", subcategory: "Debating", difficulty: "EASY", weight: 0.55 },

  // ─── Leadership (20) ─────────────────────────────────────────
  { text: "I enjoy taking charge and leading projects.", textHi: "मुझे जिम्मेदारी लेने और परियोजनाओं का नेतृत्व करने में आनंद आता है।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", difficulty: "EASY", weight: 0.9, memoryKey: "interests" },
  { text: "I am comfortable making decisions under pressure.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Decision Making", difficulty: "MEDIUM", weight: 0.8 },
  { text: "I enjoy setting goals and creating plans to achieve them.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Goal Setting", difficulty: "EASY", weight: 0.75 },
  { text: "I take responsibility for my team's successes and failures.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Accountability", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I would like to start my own business someday.", textHi: "मैं किसी दिन अपना खुद का व्यवसाय शुरू करना चाहूंगा।", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Entrepreneurship", difficulty: "EASY", weight: 0.85, contextTrigger: "page:careers", memoryKey: "goals.entrepreneurship" },
  { text: "I enjoy strategic thinking and long-term planning.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Strategy", difficulty: "MEDIUM", weight: 0.75 },
  { text: "I am good at delegating tasks and managing workloads.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Delegation", difficulty: "MEDIUM", weight: 0.6 },
  { text: "I enjoy building and managing teams.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Team Building", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I am comfortable with taking calculated risks.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Risk Taking", difficulty: "MEDIUM", weight: 0.65, memoryKey: "personality.riskTolerance" },
  { text: "I enjoy reading about successful entrepreneurs and business leaders.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", difficulty: "EASY", weight: 0.55 },
  { text: "I like mentoring and developing talent in others.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Mentoring", difficulty: "MEDIUM", weight: 0.65 },
  { text: "I enjoy managing budgets and financial resources.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Finance", difficulty: "HARD", weight: 0.6 },
  { text: "I am good at inspiring and rallying others around a vision.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Vision", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I enjoy project management methodologies like Agile or Scrum.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Project Management", difficulty: "MEDIUM", weight: 0.55 },
  { text: "I would enjoy being a CEO or CTO of a company.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "C-Suite", difficulty: "MEDIUM", weight: 0.75, contextTrigger: "page:careers" },
  { text: "I enjoy making product decisions and prioritizing features.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Product", difficulty: "MEDIUM", weight: 0.7 },
  { text: "I am comfortable with ambiguity and changing requirements.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", difficulty: "HARD", weight: 0.6 },
  { text: "I enjoy operations management and process improvement.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Operations", difficulty: "HARD", weight: 0.55 },
  { text: "I enjoy reading business books and case studies.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", difficulty: "EASY", weight: 0.5 },
  { text: "I enjoy coaching and giving constructive feedback.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Leadership", subcategory: "Coaching", difficulty: "MEDIUM", weight: 0.6 },

  // ─── Lifestyle (20) ──────────────────────────────────────────
  { text: "What hobbies do you enjoy in your free time?", type: "MULTI_SELECT", options: [{ id: "gaming", text: "Gaming" }, { id: "sports", text: "Sports" }, { id: "reading", text: "Reading" }, { id: "travel", text: "Travel" }, { id: "cooking", text: "Cooking" }, { id: "music", text: "Music" }, { id: "fitness", text: "Fitness" }, { id: "socializing", text: "Socializing" }], category: "Lifestyle", difficulty: "EASY", weight: 0.7, memoryKey: "lifestyle.hobbies" },
  { text: "Do you enjoy playing video games?", textHinglish: "Kya aapko video games khelna pasand hai?", type: "MCQ", options: [{ id: "daily", text: "Yes, almost daily", value: 3 }, { id: "sometimes", text: "Sometimes", value: 2 }, { id: "rarely", text: "Rarely", value: 1 }, { id: "never", text: "Never", value: 0 }], category: "Lifestyle", subcategory: "Gaming", difficulty: "EASY", weight: 0.5, memoryKey: "lifestyle.gaming" },
  { text: "Do you enjoy reading books?", type: "MCQ", options: [{ id: "daily", text: "Read regularly", value: 3 }, { id: "sometimes", text: "Occasionally", value: 2 }, { id: "rarely", text: "Rarely", value: 1 }], category: "Lifestyle", subcategory: "Reading", difficulty: "EASY", weight: 0.5, memoryKey: "lifestyle.reading" },
  { text: "Do you play any sports or exercise regularly?", type: "MCQ", options: [{ id: "daily", text: "Yes, regularly", value: 3 }, { id: "sometimes", text: "Sometimes", value: 2 }, { id: "no", text: "Not really", value: 0 }], category: "Lifestyle", subcategory: "Sports", difficulty: "EASY", weight: 0.45, memoryKey: "lifestyle.sports" },
  { text: "Do you enjoy cooking or food experiments?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Lifestyle", subcategory: "Cooking", difficulty: "EASY", weight: 0.35, memoryKey: "lifestyle.cooking" },
  { text: "How many hours per day do you spend on a computer or phone?", type: "MCQ", options: [{ id: "lt2", text: "Less than 2 hours", value: 1 }, { id: "2to5", text: "2-5 hours", value: 2 }, { id: "5to8", text: "5-8 hours", value: 3 }, { id: "gt8", text: "More than 8 hours", value: 4 }], category: "Lifestyle", subcategory: "Screen Time", difficulty: "EASY", weight: 0.5 },
  { text: "Do you prefer routine-based work or variety in tasks?", type: "MCQ", options: [{ id: "routine", text: "Routine and structure", value: 1 }, { id: "variety", text: "Variety and change", value: 3 }, { id: "mix", text: "A good mix of both", value: 2 }], category: "Lifestyle", difficulty: "EASY", weight: 0.6, memoryKey: "personality.workStyle" },
  { text: "Would you be willing to relocate for a career opportunity?", textHi: "क्या आप करियर के अवसर के लिए स्थानांतरित होने को तैयार होंगे?", type: "MCQ", options: [{ id: "yes", text: "Yes, anywhere", value: 3 }, { id: "domestic", text: "Within India", value: 2 }, { id: "local", text: "Prefer my current city", value: 1 }], category: "Lifestyle", subcategory: "Relocation", difficulty: "EASY", weight: 0.75, contextTrigger: "page:colleges", memoryKey: "demographics.relocation" },
  { text: "Do you prefer working from home or in an office?", type: "MCQ", options: [{ id: "remote", text: "Fully remote", value: 3 }, { id: "hybrid", text: "Hybrid", value: 2 }, { id: "office", text: "Office", value: 1 }], category: "Lifestyle", difficulty: "EASY", weight: 0.6, memoryKey: "personality.workLocation" },
  { text: "Are you a morning person or a night owl?", type: "MCQ", options: [{ id: "morning", text: "Morning person", value: 1 }, { id: "night", text: "Night owl", value: 2 }, { id: "neither", text: "No preference", value: 0 }], category: "Lifestyle", difficulty: "EASY", weight: 0.35 },
  { text: "Do you enjoy traveling and experiencing new places?", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Lifestyle", subcategory: "Travel", difficulty: "EASY", weight: 0.45, memoryKey: "lifestyle.travel" },
  { text: "How important is work-life balance to you?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Work-Life Balance" }], category: "Lifestyle", difficulty: "EASY", weight: 0.7, memoryKey: "personality.workLifeBalance" },
  { text: "Do you enjoy learning new languages?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Lifestyle", subcategory: "Languages", difficulty: "EASY", weight: 0.4 },
  { text: "Do you follow any content creators or influencers for learning?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Lifestyle", subcategory: "Content", difficulty: "EASY", weight: 0.4 },
  { text: "Are you interested in sustainable living and environmental issues?", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Lifestyle", subcategory: "Environment", difficulty: "EASY", weight: 0.45 },
  { text: "Do you enjoy participating in hackathons or competitions?", type: "MCQ", options: [{ id: "regular", text: "Yes, regularly", value: 3 }, { id: "tried", text: "Tried a few", value: 2 }, { id: "never", text: "Never", value: 0 }], category: "Lifestyle", subcategory: "Competitions", difficulty: "EASY", weight: 0.55, memoryKey: "lifestyle.hackathons" },
  { text: "How do you usually spend your weekends?", type: "MULTI_SELECT", options: [{ id: "study", text: "Studying / Learning" }, { id: "social", text: "Meeting friends" }, { id: "relax", text: "Relaxing at home" }, { id: "hobby", text: "Pursuing hobbies" }, { id: "work", text: "Working on projects" }], category: "Lifestyle", difficulty: "EASY", weight: 0.45, memoryKey: "lifestyle.weekends" },
  { text: "Do you enjoy entrepreneurial side projects?", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Lifestyle", subcategory: "Entrepreneurship", difficulty: "EASY", weight: 0.65, memoryKey: "lifestyle.entrepreneurial" },
  { text: "Do you enjoy writing blogs, articles, or journaling?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Lifestyle", subcategory: "Writing", difficulty: "EASY", weight: 0.4, memoryKey: "lifestyle.writing" },
  { text: "How important is earning a high salary in your career choice?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Salary Importance" }], category: "Lifestyle", difficulty: "EASY", weight: 0.75, memoryKey: "personality.salaryImportance" },

  // ─── Financial (15) ──────────────────────────────────────────
  { text: "What is your approximate family annual income?", type: "MCQ", options: [{ id: "lt3", text: "Below ₹3 LPA", value: 1 }, { id: "3to6", text: "₹3-6 LPA", value: 2 }, { id: "6to12", text: "₹6-12 LPA", value: 3 }, { id: "12to25", text: "₹12-25 LPA", value: 4 }, { id: "gt25", text: "Above ₹25 LPA", value: 5 }], category: "Financial", difficulty: "EASY", weight: 0.85, contextTrigger: "page:colleges", memoryKey: "budget.familyIncome" },
  { text: "What is your maximum budget for education per year?", type: "MCQ", options: [{ id: "lt1", text: "Below ₹1 Lakh", value: 1 }, { id: "1to3", text: "₹1-3 Lakhs", value: 2 }, { id: "3to5", text: "₹3-5 Lakhs", value: 3 }, { id: "5to10", text: "₹5-10 Lakhs", value: 4 }, { id: "gt10", text: "Above ₹10 Lakhs", value: 5 }], category: "Financial", difficulty: "EASY", weight: 0.9, contextTrigger: "page:colleges", memoryKey: "budget.educationBudget" },
  { text: "Are you looking for scholarship opportunities?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Financial", subcategory: "Scholarships", difficulty: "EASY", weight: 0.75, contextTrigger: "page:colleges", memoryKey: "budget.needsScholarship" },
  { text: "Would you consider an education loan?", type: "MCQ", options: [{ id: "yes", text: "Yes, open to it", value: 2 }, { id: "maybe", text: "As a last resort", value: 1 }, { id: "no", text: "Prefer not to", value: 0 }], category: "Financial", difficulty: "EASY", weight: 0.65, contextTrigger: "page:colleges", memoryKey: "budget.loanPreference" },
  { text: "What is your expected starting salary (LPA)?", type: "MCQ", options: [{ id: "lt3", text: "Below ₹3 LPA", value: 1 }, { id: "3to6", text: "₹3-6 LPA", value: 2 }, { id: "6to10", text: "₹6-10 LPA", value: 3 }, { id: "10to20", text: "₹10-20 LPA", value: 4 }, { id: "gt20", text: "Above ₹20 LPA", value: 5 }], category: "Financial", difficulty: "EASY", weight: 0.7, memoryKey: "goals.salaryExpectation" },
  { text: "How important is financial stability vs passion in your career?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Stability ← → Passion" }], category: "Financial", difficulty: "EASY", weight: 0.7, memoryKey: "personality.stabilityVsPassion" },
  { text: "Do you have any passive income sources?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Financial", difficulty: "MEDIUM", weight: 0.35 },
  { text: "Are you interested in personal finance and investing?", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Financial", subcategory: "Investing", difficulty: "EASY", weight: 0.5 },
  { text: "Do you plan to support your family financially in the near future?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Financial", difficulty: "EASY", weight: 0.55, memoryKey: "budget.familySupport" },
  { text: "Would you prefer a higher salary or better work-life balance?", type: "MCQ", options: [{ id: "salary", text: "Higher salary", value: 1 }, { id: "balance", text: "Better balance", value: 3 }, { id: "both", text: "Both equally", value: 2 }], category: "Financial", difficulty: "EASY", weight: 0.6 },
  { text: "Are you eligible for any government scholarship schemes?", type: "MCQ", options: [{ id: "yes", text: "Yes", value: 2 }, { id: "maybe", text: "Not sure", value: 1 }, { id: "no", text: "No", value: 0 }], category: "Financial", subcategory: "Scholarships", difficulty: "EASY", weight: 0.55, contextTrigger: "page:colleges" },
  { text: "What is your expected ROI timeframe for education investment?", type: "MCQ", options: [{ id: "1to2", text: "1-2 years", value: 1 }, { id: "3to5", text: "3-5 years", value: 2 }, { id: "5to10", text: "5-10 years", value: 3 }, { id: "gt10", text: "10+ years", value: 4 }], category: "Financial", difficulty: "MEDIUM", weight: 0.55, contextTrigger: "page:parents" },
  { text: "Have your parents set a specific budget for your education?", type: "MCQ", options: [{ id: "yes", text: "Yes, fixed budget", value: 2 }, { id: "flexible", text: "Flexible", value: 1 }, { id: "no", text: "No specific budget", value: 0 }], category: "Financial", difficulty: "EASY", weight: 0.6, contextTrigger: "page:parents", memoryKey: "budget.parentBudget" },
  { text: "Are you interested in part-time work during studies?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Financial", subcategory: "Part-time", difficulty: "EASY", weight: 0.4 },
  { text: "Do you plan to pursue higher studies abroad?", type: "MCQ", options: [{ id: "yes", text: "Definitely", value: 3 }, { id: "maybe", text: "Considering it", value: 2 }, { id: "no", text: "Prefer India", value: 1 }], category: "Financial", difficulty: "EASY", weight: 0.7, memoryKey: "goals.studyAbroad" },

  // ─── Career Preferences (20) ─────────────────────────────────
  { text: "What type of work environment do you prefer?", type: "MCQ", options: [{ id: "startup", text: "Fast-paced startup", value: 4 }, { id: "corporate", text: "Structured corporate", value: 2 }, { id: "freelance", text: "Freelance / Independent", value: 3 }, { id: "govt", text: "Government / Public sector", value: 1 }], category: "Career", difficulty: "EASY", weight: 0.85, memoryKey: "personality.workEnvironment" },
  { text: "Which industries interest you most?", type: "MULTI_SELECT", options: [{ id: "tech", text: "Technology" }, { id: "health", text: "Healthcare" }, { id: "finance", text: "Finance" }, { id: "education", text: "Education" }, { id: "creative", text: "Creative / Media" }, { id: "science", text: "Science / Research" }, { id: "govt", text: "Government" }, { id: "startup", text: "Startups" }], category: "Career", difficulty: "EASY", weight: 0.9, memoryKey: "interests" },
  { text: "What is your short-term career goal (next 1-2 years)?", type: "FREE_TEXT", options: [], category: "Career", difficulty: "EASY", weight: 0.8, memoryKey: "goals.shortTerm" },
  { text: "What is your long-term career goal (next 5-10 years)?", type: "FREE_TEXT", options: [], category: "Career", difficulty: "MEDIUM", weight: 0.8, memoryKey: "goals.longTerm" },
  { text: "Are you considering a career switch?", type: "MCQ", options: [{ id: "yes", text: "Yes, actively", value: 3 }, { id: "maybe", text: "Exploring options", value: 2 }, { id: "no", text: "No, on track", value: 0 }], category: "Career", subcategory: "Career Switch", difficulty: "EASY", weight: 0.85, contextTrigger: "page:careers" },
  { text: "How important is job security to you?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Job Security" }], category: "Career", difficulty: "EASY", weight: 0.65, memoryKey: "personality.jobSecurity" },
  { text: "Would you prefer a government job or private sector?", type: "MCQ", options: [{ id: "govt", text: "Government", value: 1 }, { id: "private", text: "Private", value: 2 }, { id: "either", text: "Either is fine", value: 0 }], category: "Career", difficulty: "EASY", weight: 0.7 },
  { text: "What matters most to you in a job?", type: "RANKING", options: [{ id: "salary", text: "Salary" }, { id: "growth", text: "Growth" }, { id: "impact", text: "Impact" }, { id: "balance", text: "Work-Life Balance" }, { id: "learning", text: "Learning" }], category: "Career", difficulty: "EASY", weight: 0.85, memoryKey: "personality.jobPriorities" },
  { text: "I am open to learning completely new skills for my dream career.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Career", difficulty: "EASY", weight: 0.6 },
  { text: "I prefer depth of expertise over breadth of knowledge.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Career", difficulty: "MEDIUM", weight: 0.55, memoryKey: "personality.depthVsBreadth" },
  { text: "How soon do you need to start working full-time?", type: "MCQ", options: [{ id: "now", text: "Immediately", value: 1 }, { id: "6m", text: "Within 6 months", value: 2 }, { id: "1y", text: "Within 1 year", value: 3 }, { id: "2y", text: "2+ years", value: 4 }], category: "Career", difficulty: "EASY", weight: 0.65 },
  { text: "Are you interested in AI-native careers?", textHinglish: "Kya aapko AI-based careers mein interest hai?", type: "MCQ", options: [{ id: "very", text: "Very interested", value: 3 }, { id: "curious", text: "Curious about it", value: 2 }, { id: "no", text: "Not particularly", value: 0 }], category: "Career", subcategory: "AI Careers", difficulty: "EASY", weight: 0.85, contextTrigger: "page:careers" },
  { text: "Would you consider freelancing as your primary career?", type: "MCQ", options: [{ id: "yes", text: "Absolutely", value: 3 }, { id: "side", text: "As a side income", value: 2 }, { id: "no", text: "Prefer employment", value: 1 }], category: "Career", difficulty: "EASY", weight: 0.6 },
  { text: "How risk-tolerant are you in career decisions?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Risk Tolerance" }], category: "Career", difficulty: "EASY", weight: 0.7, memoryKey: "personality.careerRiskTolerance" },
  { text: "Are you interested in the creator economy (YouTube, Instagram, podcasts)?", type: "MCQ", options: [{ id: "active", text: "Already creating", value: 3 }, { id: "interested", text: "Interested", value: 2 }, { id: "no", text: "Not for me", value: 0 }], category: "Career", subcategory: "Creator Economy", difficulty: "EASY", weight: 0.6 },
  { text: "I enjoy working on cross-functional projects.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Career", difficulty: "MEDIUM", weight: 0.5 },
  { text: "Would you enjoy a career in consulting?", type: "MCQ", options: [{ id: "yes", text: "Very much", value: 3 }, { id: "maybe", text: "Maybe", value: 2 }, { id: "no", text: "Not really", value: 0 }], category: "Career", subcategory: "Consulting", difficulty: "MEDIUM", weight: 0.55 },
  { text: "How important is international career exposure to you?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "International Exposure" }], category: "Career", difficulty: "EASY", weight: 0.55 },
  { text: "Would you enjoy a career in product management?", type: "MCQ", options: [{ id: "yes", text: "Yes!", value: 3 }, { id: "maybe", text: "Maybe", value: 2 }, { id: "no", text: "Probably not", value: 0 }], category: "Career", subcategory: "Product", difficulty: "MEDIUM", weight: 0.65, contextTrigger: "page:careers" },
  { text: "I am interested in careers that involve continuous learning.", type: "AGREE_DISAGREE", options: AGREE_OPTIONS, category: "Career", difficulty: "EASY", weight: 0.6 },

  // ─── Education (15) ──────────────────────────────────────────
  { text: "What is your current education level?", type: "MCQ", options: [{ id: "10", text: "Class 10 or below" }, { id: "12", text: "Class 12" }, { id: "ug", text: "Undergraduate" }, { id: "pg", text: "Postgraduate" }, { id: "phd", text: "PhD" }, { id: "working", text: "Working Professional" }], category: "Education", difficulty: "EASY", weight: 0.95, memoryKey: "education.level" },
  { text: "What was your percentage in the last exam?", type: "MCQ", options: [{ id: "90p", text: "Above 90%", value: 5 }, { id: "80p", text: "80-90%", value: 4 }, { id: "70p", text: "70-80%", value: 3 }, { id: "60p", text: "60-70%", value: 2 }, { id: "lt60", text: "Below 60%", value: 1 }], category: "Education", difficulty: "EASY", weight: 0.9, memoryKey: "marks.percentage" },
  { text: "Which stream are you in?", type: "MCQ", options: [{ id: "science", text: "Science (PCM/PCB)" }, { id: "commerce", text: "Commerce" }, { id: "arts", text: "Arts / Humanities" }, { id: "eng", text: "Engineering" }, { id: "med", text: "Medical" }, { id: "other", text: "Other" }], category: "Education", difficulty: "EASY", weight: 0.9, memoryKey: "education.stream" },
  { text: "What board are you from?", type: "MCQ", options: [{ id: "cbse", text: "CBSE" }, { id: "icse", text: "ICSE" }, { id: "state", text: "State Board" }, { id: "ib", text: "IB" }, { id: "igcse", text: "IGCSE" }, { id: "other", text: "Other" }], category: "Education", difficulty: "EASY", weight: 0.7, memoryKey: "education.board" },
  { text: "Which entrance exams are you preparing for?", type: "MULTI_SELECT", options: [{ id: "jee", text: "JEE" }, { id: "neet", text: "NEET" }, { id: "cat", text: "CAT" }, { id: "gate", text: "GATE" }, { id: "upsc", text: "UPSC" }, { id: "clat", text: "CLAT" }, { id: "none", text: "Not preparing" }], category: "Education", difficulty: "EASY", weight: 0.85, memoryKey: "education.entranceExams" },
  { text: "What is the name of your current institution?", type: "FREE_TEXT", options: [], category: "Education", difficulty: "EASY", weight: 0.6, memoryKey: "education.institution" },
  { text: "Do you prefer practical learning or theoretical study?", type: "MCQ", options: [{ id: "practical", text: "Hands-on practical", value: 3 }, { id: "theory", text: "Theoretical depth", value: 1 }, { id: "both", text: "Balanced mix", value: 2 }], category: "Education", difficulty: "EASY", weight: 0.6, memoryKey: "personality.learningStyle" },
  { text: "Which city or state do you prefer for higher education?", type: "FREE_TEXT", options: [], category: "Education", difficulty: "EASY", weight: 0.7, contextTrigger: "page:colleges", memoryKey: "demographics.preferredCity" },
  { text: "Are you interested in online degrees or courses?", type: "MCQ", options: [{ id: "yes", text: "Yes, very much", value: 3 }, { id: "supplement", text: "As supplement", value: 2 }, { id: "no", text: "Prefer traditional", value: 1 }], category: "Education", difficulty: "EASY", weight: 0.55 },
  { text: "What subjects did you enjoy most in school?", type: "MULTI_SELECT", options: [{ id: "math", text: "Mathematics" }, { id: "physics", text: "Physics" }, { id: "chemistry", text: "Chemistry" }, { id: "biology", text: "Biology" }, { id: "cs", text: "Computer Science" }, { id: "english", text: "English" }, { id: "history", text: "History" }, { id: "economics", text: "Economics" }], category: "Education", difficulty: "EASY", weight: 0.8, memoryKey: "education.favoriteSubjects" },
  { text: "How confident are you about your career direction?", type: "SLIDER", options: [{ min: 0, max: 100, step: 10, label: "Career Confidence" }], category: "Education", difficulty: "EASY", weight: 0.7, memoryKey: "personality.careerConfidence" },
  { text: "Do you have any certifications?", type: "MCQ", options: [{ id: "multiple", text: "Yes, multiple", value: 3 }, { id: "one", text: "One or two", value: 2 }, { id: "no", text: "Not yet", value: 0 }], category: "Education", subcategory: "Certifications", difficulty: "EASY", weight: 0.55 },
  { text: "Which competitive exam rank bracket do you fall in?", type: "MCQ", options: [{ id: "top1", text: "Top 1%", value: 5 }, { id: "top10", text: "Top 10%", value: 4 }, { id: "top25", text: "Top 25%", value: 3 }, { id: "top50", text: "Top 50%", value: 2 }, { id: "na", text: "Not applicable", value: 0 }], category: "Education", difficulty: "MEDIUM", weight: 0.65, memoryKey: "marks.rank" },
  { text: "Are you the first person in your family to pursue higher education?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Education", difficulty: "EASY", weight: 0.5, memoryKey: "demographics.firstGeneration" },
  { text: "Do you have access to a personal computer or laptop?", type: "YES_NO", options: YES_NO_OPTIONS, category: "Education", difficulty: "EASY", weight: 0.45, memoryKey: "demographics.hasComputer" },
];

async function main() {
  console.log(`Seeding ${QUESTIONS.length} adaptive questions...`);

  // Clear existing adaptive questions to avoid duplicates
  await prisma.adaptiveQuestion.deleteMany({});

  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < QUESTIONS.length; i += batchSize) {
    const batch = QUESTIONS.slice(i, i + batchSize);
    await prisma.adaptiveQuestion.createMany({
      data: batch.map((q) => ({
        text: q.text,
        textHi: q.textHi || null,
        textHinglish: q.textHinglish || null,
        type: q.type,
        options: q.options,
        category: q.category,
        subcategory: q.subcategory || null,
        difficulty: q.difficulty,
        weight: q.weight,
        contextTrigger: q.contextTrigger || null,
        memoryKey: q.memoryKey || null,
        language: "en",
        isActive: true,
      })),
    });
    console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, QUESTIONS.length)}/${QUESTIONS.length})`);
  }

  console.log(`\n✅ Successfully seeded ${QUESTIONS.length} adaptive questions!`);
  console.log(`   Categories: Analytical(30), Creative(25), Technical(30), Social(25), Leadership(20), Lifestyle(20), Financial(15), Career(20), Education(15)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
