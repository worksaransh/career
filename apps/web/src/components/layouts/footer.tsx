import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/career-explorer", label: "Career Explorer" },
    { href: "/college-explorer", label: "College Explorer" },
    { href: "/degree-explorer", label: "Degree Explorer" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/contact", label: "Careers" },
  ],
  Support: [
    { href: "/faq", label: "FAQ" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  Resources: [
    { href: "/skills-explorer", label: "Skills Explorer" },
    { href: "/scholarship-explorer", label: "Scholarships" },
    { href: "/blog", label: "Career Guides" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold"
              aria-label="Career OS Home"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="gradient-text">Career OS</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              AI-powered career guidance platform. See your future before you decide.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <ul className="mt-3 space-y-2" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} Career OS. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
