import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Career OS terms of service — the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="lead">Last updated: January 2024</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing Career OS, you agree to these terms. If you do not agree, do not use
          the service. We may update these terms; continued use constitutes acceptance.
        </p>

        <h2>2. Account Registration</h2>
        <p>
          You must provide accurate information when creating an account. You are responsible
          for maintaining the confidentiality of your credentials and for all activities
          under your account.
        </p>

        <h2>3. Subscriptions & Payments</h2>
        <p>
          Premium features require a paid subscription. Fees are billed in advance and are
          non-refundable except as required by law. You can cancel anytime.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>
          You agree not to misuse the platform, attempt to access data without authorization,
          or use the service for any illegal purpose. We reserve the right to suspend accounts
          that violate these terms.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          Career OS provides guidance and recommendations based on AI analysis. We do not
          guarantee specific outcomes. Our liability is limited to the amount paid for the
          service in the past 12 months.
        </p>
      </article>
    </div>
  );
}
