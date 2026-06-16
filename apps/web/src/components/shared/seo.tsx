import React from "react";
import type { SEOMetadata } from "@career-os/types";

interface SEOHeadProps {
  metadata: SEOMetadata;
  path?: string;
}

export function generateJsonLd(schema: Record<string, unknown>) {
  return JSON.stringify(schema);
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Career OS",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo.svg`,
    description:
      "AI-powered career guidance platform. See your future before you decide.",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@careeros.ai",
      contactType: "customer support",
    },
    sameAs: [
      "https://twitter.com/careeros",
      "https://linkedin.com/company/careeros",
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Career OS",
    url: process.env.NEXT_PUBLIC_APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
