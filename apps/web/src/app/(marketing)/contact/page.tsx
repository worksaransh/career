import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Career OS team. We're here to help.",
};

export default function ContactPage() {
  return <ContactContent />;
}
