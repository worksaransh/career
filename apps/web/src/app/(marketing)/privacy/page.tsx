import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Career OS privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: January 2024</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly, including name, email, phone number,
          educational background, career interests, and assessment responses. We also collect
          usage data such as pages visited, features used, and interaction patterns to improve
          our AI recommendations.
        </p>

        <h2>2. How We Use Your Data</h2>
        <p>
          Your data is used to provide personalized career recommendations, improve our AI models,
          send relevant notifications, and analyze platform usage. We never sell your personal
          information to third parties.
        </p>

        <h2>3. Data Protection</h2>
        <p>
          We implement industry-standard encryption, access controls, and security practices to
          protect your data. All data is encrypted in transit (TLS 1.3) and at rest (AES-256).
        </p>

        <h2>4. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your data at any time. You can export
          your data from your account settings. We comply with DPDP (Digital Personal Data
          Protection) regulations.
        </p>

        <h2>5. Contact</h2>
        <p>
          For privacy-related inquiries, contact our Data Protection Officer at privacy@careeros.ai.
        </p>
      </article>
    </div>
  );
}
