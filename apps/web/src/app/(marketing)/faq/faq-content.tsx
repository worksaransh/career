"use client";

import React from "react";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaSection } from "@/components/marketing/cta-section";

export function FaqContent() {
  return (
    <div className="pt-24">
      <FaqSection />
      <CtaSection />
    </div>
  );
}
