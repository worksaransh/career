import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Career OS — our mission to democratize career guidance with AI.",
};

export default function AboutPage() {
  return <AboutContent />;
}
