// Mock domain data powering the MVP shell. Replace with server functions
// + Lovable Cloud queries when the backend lands.

export type Career = {
  id: string;
  title: string;
  emoji: string;
  matchScore: number; // 0-100
  why: string[];
  salaryEntry: number; // INR LPA
  salaryMid: number;
  demandIndex: number; // 0-100
  aiRisk: "Low" | "Medium" | "High";
  education: string;
  alternatives: string[];
};

export const CAREERS: Career[] = [
  {
    id: "product-manager",
    title: "Product Manager",
    emoji: "🧭",
    matchScore: 92,
    why: [
      "Strong analytical + people skills",
      "Curious about how products are built",
      "High tolerance for ambiguity",
    ],
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
    matchScore: 87,
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
    matchScore: 81,
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
    matchScore: 74,
    why: ["Disciplined", "Comfortable with rules", "Family preference signal"],
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
    matchScore: 68,
    why: ["Public-service motivation", "Strong general awareness", "Long-term mindset"],
    salaryEntry: 7,
    salaryMid: 18,
    demandIndex: 55,
    aiRisk: "Low",
    education: "Any graduation + UPSC prep",
    alternatives: ["State PSC", "Policy Researcher", "NGO Leadership"],
  },
];

export type Phase = {
  id: string;
  title: string;
  period: string;
  cost: string;
  milestones: string[];
  salaryAt: number; // LPA at end of phase
};

export const ROADMAP_PM: { goal: string; current: string; phases: Phase[] } = {
  current: "Class 12 — Commerce",
  goal: "Product Manager at a top tech company",
  phases: [
    {
      id: "p1",
      title: "Foundation degree",
      period: "2026–2029 · 3 yrs",
      cost: "₹3–8 L total",
      milestones: [
        "BBA from a Tier-1 college (NMIMS / Christ / SRCC)",
        "Crack DU JAT / NPAT / IPMAT",
        "1 product internship in summer of Year 2",
      ],
      salaryAt: 0,
    },
    {
      id: "p2",
      title: "Skill stack",
      period: "Year 1–3 of degree",
      cost: "₹15–30 K certs",
      milestones: [
        "SQL + Excel + basic Python",
        "Google PM certificate (Coursera)",
        "Ship 1 side project — landing page + 100 users",
      ],
      salaryAt: 0,
    },
    {
      id: "p3",
      title: "First PM role",
      period: "2029–2031 · 2 yrs",
      cost: "—",
      milestones: [
        "APM at a startup (Razorpay / CRED / Zerodha tier)",
        "Own one feature end-to-end",
        "Build a public portfolio of case studies",
      ],
      salaryAt: 14,
    },
    {
      id: "p4",
      title: "Senior PM",
      period: "2031–2034 · 3 yrs",
      cost: "—",
      milestones: [
        "Lead a 0-to-1 product",
        "Mentor 2 APMs",
        "Optional: MBA at ISB / IIM-A if pivoting to leadership",
      ],
      salaryAt: 38,
    },
  ],
};

export const DEGREES = [
  { id: "bba", name: "BBA", duration: "3 yrs", avgCost: "₹3–8 L", topColleges: ["NMIMS", "Christ", "SRCC"] },
  { id: "btech-cs", name: "B.Tech CS", duration: "4 yrs", avgCost: "₹8–20 L", topColleges: ["IIT", "BITS", "IIIT-H"] },
  { id: "bcom", name: "B.Com (Hons)", duration: "3 yrs", avgCost: "₹1–4 L", topColleges: ["SRCC", "LSR", "Hindu"] },
];

export const COLLEGES = [
  { id: "srcc", name: "SRCC", city: "Delhi", fees: "₹1.2 L", placement: "₹12 LPA avg", cutoff: "98%+" },
  { id: "nmims", name: "NMIMS Mumbai", city: "Mumbai", fees: "₹7 L", placement: "₹9 LPA avg", cutoff: "NPAT 240+" },
  { id: "christ", name: "Christ University", city: "Bangalore", fees: "₹4 L", placement: "₹7 LPA avg", cutoff: "85%+" },
];

export const ASSESSMENT_QUESTIONS: { id: string; text: { en: string; hi: string; hinglish: string }; options: { en: string; hi: string; hinglish: string }[] }[] = [
  {
    id: "q1",
    text: {
      en: "When you have free time, you most often…",
      hi: "खाली समय में आप अक्सर क्या करते हैं?",
      hinglish: "Free time mein aap zyada kya karte ho?",
    },
    options: [
      { en: "Build or fix something", hi: "कुछ बनाते या ठीक करते हैं", hinglish: "Kuch banate ya theek karte ho" },
      { en: "Read, write or research", hi: "पढ़ते, लिखते या शोध करते हैं", hinglish: "Padhte, likhte ya research karte ho" },
      { en: "Meet & talk to people", hi: "लोगों से मिलते-बात करते हैं", hinglish: "Logon se milte-baat karte ho" },
      { en: "Draw, design or create", hi: "ड्रॉ, डिज़ाइन या क्रिएट करते हैं", hinglish: "Draw, design ya create karte ho" },
    ],
  },
  {
    id: "q2",
    text: {
      en: "Which subject feels easiest to you?",
      hi: "कौन सा विषय आपको सबसे आसान लगता है?",
      hinglish: "Konsa subject aapko sabse easy lagta hai?",
    },
    options: [
      { en: "Math / Logic", hi: "गणित / तर्क", hinglish: "Math / Logic" },
      { en: "Language / Literature", hi: "भाषा / साहित्य", hinglish: "Language / Literature" },
      { en: "Science / Experiments", hi: "विज्ञान / प्रयोग", hinglish: "Science / Experiments" },
      { en: "Commerce / Money", hi: "वाणिज्य / पैसा", hinglish: "Commerce / Paisa" },
    ],
  },
  {
    id: "q3",
    text: {
      en: "Picture yourself in 10 years. What matters most?",
      hi: "10 साल बाद की कल्पना करें। क्या सबसे ज़रूरी है?",
      hinglish: "10 saal baad ki kalpana karo. Sabse important kya hai?",
    },
    options: [
      { en: "High income", hi: "अच्छी कमाई", hinglish: "Achi kamai" },
      { en: "Freedom & flexibility", hi: "आज़ादी और लचीलापन", hinglish: "Freedom aur flexibility" },
      { en: "Impact on society", hi: "समाज पर असर", hinglish: "Society pe impact" },
      { en: "Stability & security", hi: "स्थिरता और सुरक्षा", hinglish: "Stability aur security" },
    ],
  },
  {
    id: "q4",
    text: {
      en: "How do you make decisions?",
      hi: "आप निर्णय कैसे लेते हैं?",
      hinglish: "Aap decisions kaise lete ho?",
    },
    options: [
      { en: "Analyse data carefully", hi: "डेटा को ध्यान से देखकर", hinglish: "Data carefully analyse karke" },
      { en: "Follow my gut", hi: "अपनी अंदरूनी आवाज़ से", hinglish: "Apne gut feeling se" },
      { en: "Ask friends & family", hi: "दोस्तों/परिवार से पूछकर", hinglish: "Friends/family se poochke" },
      { en: "Try and learn fast", hi: "करके सीखता हूँ", hinglish: "Try karke sikhta/sikhti hoon" },
    ],
  },
  {
    id: "q5",
    text: {
      en: "Which environment energises you?",
      hi: "कौन सा माहौल आपको ऊर्जा देता है?",
      hinglish: "Kaisa environment aapko energy deta hai?",
    },
    options: [
      { en: "Fast-paced startup", hi: "तेज़ रफ़्तार स्टार्टअप", hinglish: "Fast-paced startup" },
      { en: "Structured corporate", hi: "व्यवस्थित कॉर्पोरेट", hinglish: "Structured corporate" },
      { en: "Creative studio", hi: "क्रिएटिव स्टूडियो", hinglish: "Creative studio" },
      { en: "Public service / lab", hi: "सरकारी सेवा / प्रयोगशाला", hinglish: "Public service / lab" },
    ],
  },
];
