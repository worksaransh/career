// Programmatic SEO Engine — generate SEO-optimized pages for careers, colleges, degrees

export interface SEOPage {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  contentSections: SEOContentSection[];
  faqSchema: FAQSchema[];
  breadcrumbs: Breadcrumb[];
  canonical: string;
  ogImage: string;
}

export interface SEOContentSection {
  heading: string;
  body: string;
  type: "TEXT" | "LIST" | "TABLE" | "COMPARISON";
  items?: string[];
}

export interface FAQSchema {
  question: string;
  answer: string;
}

export interface Breadcrumb {
  label: string;
  url: string;
}

const CAREER_TEMPLATES: Record<string, { description: string; salary: number; demand: string; skills: string[] }> = {
  "Software Engineer": {
    description: "Software Engineers design, develop, and maintain software applications and systems. They work across web, mobile, and cloud platforms.",
    salary: 1800000,
    demand: "HIGH",
    skills: ["Python", "JavaScript", "System Design", "Data Structures", "Algorithms"],
  },
  "Data Scientist": {
    description: "Data Scientists analyze large datasets to extract insights and drive business decisions using statistical methods and machine learning.",
    salary: 2200000,
    demand: "HIGH",
    skills: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
  },
  "Product Manager": {
    description: "Product Managers define product strategy, prioritize features, and work with engineering and design teams to deliver value to users.",
    salary: 2500000,
    demand: "HIGH",
    skills: ["Strategy", "Communication", "Analytics", "User Research", "Agile"],
  },
  "Management Consultant": {
    description: "Management Consultants help organizations solve complex problems, improve performance, and implement strategic changes.",
    salary: 2000000,
    demand: "MEDIUM",
    skills: ["Analytical Thinking", "Communication", "Problem Solving", "Research", "Presentation"],
  },
  "UI/UX Designer": {
    description: "UI/UX Designers create intuitive and visually appealing user interfaces while focusing on user experience and interaction design.",
    salary: 1400000,
    demand: "MEDIUM",
    skills: ["Figma", "User Research", "Prototyping", "Visual Design", "Design Systems"],
  },
};

export function generateCareerSEOPage(careerTitle: string): SEOPage | null {
  const data = CAREER_TEMPLATES[careerTitle];
  if (!data) return null;

  const slug = careerTitle.toLowerCase().replace(/\s+/g, "-");
  const salaryText = `₹${(data.salary / 100000).toFixed(1)}`;

  const sections: SEOContentSection[] = [
    { heading: `What does a ${careerTitle} do?`, body: data.description, type: "TEXT" },
    { heading: `Salary & Growth`, body: `The average salary for a ${careerTitle} in India is ${salaryText}L per annum. Demand is ${data.demand.toLowerCase()}.`, type: "TEXT" },
    { heading: `Key Skills Required`, body: "Here are the essential skills for this career:", type: "LIST", items: data.skills },
    { heading: `How to become a ${careerTitle}`, body: `Follow these steps to start your career as a ${careerTitle.toLowerCase()}:`, type: "LIST", items: [
      `Pursue a relevant degree or certification`,
      `Build a strong portfolio of projects`,
      `Gain practical experience through internships`,
      `Network with professionals in the field`,
      `Stay updated with industry trends`,
    ] },
  ];

  const faqs: FAQSchema[] = [
    { question: `What is the salary of a ${careerTitle} in India?`, answer: `The average salary ranges from ₹${(data.salary * 0.5 / 100000).toFixed(1)}L to ₹${(data.salary * 1.5 / 100000).toFixed(1)}L depending on experience and location.` },
    { question: `What skills do I need to become a ${careerTitle}?`, answer: `Key skills include ${data.skills.slice(0, 3).join(", ")} and more.` },
    { question: `Is ${careerTitle} a good career in 2025?`, answer: `Yes, demand for ${careerTitle} is ${data.demand.toLowerCase()} and expected to grow.` },
    { question: `How long does it take to become a ${careerTitle}?`, answer: `Typically 3-4 years of education followed by 1-2 years of entry-level experience.` },
  ];

  return {
    url: `/career/${slug}`,
    title: `${careerTitle} Career Guide 2025 — Salary, Skills & Scope in India`,
    metaDescription: `Comprehensive guide to becoming a ${careerTitle} in India. Learn about salary, skills, top colleges, and career growth opportunities for ${careerTitle.toLowerCase()}s.`,
    h1: `${careerTitle} Career Guide — Everything You Need to Know`,
    contentSections: sections,
    faqSchema: faqs,
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Career Guide", url: "/careers" },
      { label: careerTitle, url: `/career/${slug}` },
    ],
    canonical: `https://careeros.ai/career/${slug}`,
    ogImage: `https://careeros.ai/og/career/${slug}.png`,
  };
}

export function generateAllCareerSEOPages(): SEOPage[] {
  return Object.keys(CAREER_TEMPLATES).map(generateCareerSEOPage).filter(Boolean) as SEOPage[];
}

export function generateSEOHeadTags(page: SEOPage): string {
  return `
    <title>${page.title}</title>
    <meta name="description" content="${page.metaDescription}" />
    <link rel="canonical" href="${page.canonical}" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.metaDescription}" />
    <meta property="og:image" content="${page.ogImage}" />
    <script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqSchema.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      })}
    </script>
  `;
}
