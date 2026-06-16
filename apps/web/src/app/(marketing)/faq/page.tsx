import type { Metadata } from "next";
import { FaqContent } from "./faq-content";

const faqItems = [
  { q: "How does Career OS match me with careers?", a: "Our AI analyzes your interests, skills, values, and assessment results using a graph-based similarity engine with 6 weighted factors to recommend the best-fitting career paths." },
  { q: "Is Career OS free?", a: "Basic career matching and assessments are free. Premium features like detailed reports, unlimited simulations, and priority support are available via subscription." },
  { q: "How accurate are the salary projections?", a: "Salary projections use Monte Carlo simulations with 1000+ iterations per career, incorporating real market data, growth trends, and AI risk analysis for confidence scoring." },
  { q: "Can parents use Career OS for their children?", a: "Yes! The Parent Dashboard provides education investment analysis, career roadmap tracking, and ROI insights to help guide your child's career decisions." },
  { q: "How is my data protected?", a: "We follow GDPR and Indian data protection laws. You can export or delete all your data anytime from the Privacy & Consent Center." },
];

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Career OS.",
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
  },
};

export default function FAQPage() {
  return <FaqContent />;
}
