import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Career insights, guides, and tips from the Career OS team.",
};

export default function BlogPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Career <span className="gradient-text">Insights</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guides, tips, and insights to help you navigate your career journey.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <article
              key={i}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className="mb-4 aspect-video rounded-lg bg-muted" />
              <p className="text-xs text-muted-foreground mb-2">Category</p>
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                Blog Post Title {i}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                Brief excerpt of the blog post content goes here...
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
