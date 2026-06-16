import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  return {
    title: `Blog Post - ${params.slug}`,
    description: "Read our latest career insights and guides.",
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <div className="pt-24 pb-16">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link href="/blog">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Blog
          </Button>
        </Link>
        <div className="mt-6">
          <div className="mb-8 aspect-video rounded-2xl bg-muted" />
          <p className="text-sm text-muted-foreground mb-2">Category</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Blog Post: {params.slug.replace(/-/g, " ")}
          </h1>
          <div className="mt-8 prose prose-gray dark:prose-invert max-w-none">
            <p>Blog post content will be loaded from the CMS.</p>
          </div>
        </div>
      </article>
    </div>
  );
}
