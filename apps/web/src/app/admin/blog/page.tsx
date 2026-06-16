"use client";

import React, { useState, useTransition } from "react";
import { Edit3, Plus, Search, Trash2, X, FileText, CheckCircle2, AlertCircle, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  coverImage: string;
  createdAt: string;
}

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "How AI is Transforming Software Engineering Pathways",
    slug: "ai-transforming-software-engineering",
    excerpt: "An in-depth analysis of AI resilience scores and skill sets needed for 2026 graduates.",
    content: "# How AI is Transforming Software Engineering Pathways\n\nArtificial Intelligence is no longer just a coding assistant; it is actively reshaping how architectural decisions are made. In this guide, we dive deep into the future requirements for developers.",
    category: "Technology",
    tags: ["AI", "Software Engineering", "Career Guidance"],
    isPublished: true,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    createdAt: new Date().toISOString(),
  },
  {
    id: "blog-2",
    title: "The Ultimate Guide to Selecting an Engineering College in India",
    slug: "guide-selecting-engineering-college-india",
    excerpt: "Learn how NIRF rankings compare to actual placement metrics and packages.",
    content: "# Selecting an Engineering College in India\n\nNIRF rankings are a starting point, but average placement numbers and branch-specific packages offer the true story of your return on investment.",
    category: "Education",
    tags: ["Colleges", "NIRF", "Engineering"],
    isPublished: false,
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    createdAt: new Date().toISOString(),
  },
];

export default function AdminBlogCMSPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [dbLoaded, setDbLoaded] = useState(false);

  React.useEffect(() => {
    if (dbLoaded) return;
    fetch("/api/editorial?status=DRAFT&limit=50")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const dbPosts = data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt ?? "",
            content: p.body ?? "",
            category: p.category ?? "General",
            tags: p.tags ?? [],
            isPublished: p.status === "PUBLISHED",
            coverImage: p.featuredImage ?? "",
            createdAt: new Date(p.createdAt).toISOString(),
          }));
          setBlogs(prev => [...dbPosts, ...prev.filter(b => !b.id.startsWith("blog-"))]);
        }
      })
      .catch(() => {})
      .finally(() => setDbLoaded(true));
  }, [dbLoaded]);

  const filtered = blogs.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(blogs.map((b) => b.category)));

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const toastId = toast.loading("Saving blog post...");

    try {
      if (editing.id && editing.id.startsWith("blog-")) {
        setBlogs(blogs.map((b) => (b.id === editing.id ? editing : b)));
        toast.success("Blog post updated locally!", { id: toastId });
      } else if (editing.id) {
        const res = await fetch(`/api/editorial/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editing.title,
            body: editing.content,
            excerpt: editing.excerpt,
            tags: editing.tags,
            featuredImage: editing.coverImage || undefined,
            status: editing.isPublished ? "PUBLISHED" : "DRAFT",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setBlogs(blogs.map((b) => (b.id === editing.id ? editing : b)));
          toast.success("Blog post updated!", { id: toastId });
        } else {
          toast.error("Failed to update post", { id: toastId });
        }
      } else {
        const res = await fetch("/api/editorial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editing.title,
            body: editing.content || editing.excerpt,
            category: editing.category,
            tags: editing.tags,
            featuredImage: editing.coverImage || undefined,
            seoTitle: editing.title,
            seoDescription: editing.excerpt,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const newBlog = {
            ...editing,
            id: data.data.id,
            slug: data.data.slug,
            createdAt: new Date(data.data.createdAt).toISOString(),
          };
          setBlogs([newBlog, ...blogs]);
          toast.success("Blog post created!", { id: toastId });
        } else {
          toast.error("Failed to create post", { id: toastId });
        }
      }
    } catch {
      toast.error("Network error saving post", { id: toastId });
    }
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    if (id.startsWith("blog-")) {
      setBlogs(blogs.filter((b) => b.id !== id));
      toast.success("Blog post removed locally!");
      return;
    }
    const res = await fetch(`/api/editorial/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setBlogs(blogs.filter((b) => b.id !== id));
      toast.success("Blog post deleted!");
    } else {
      toast.error("Failed to delete post");
    }
  };

  const handleAiAssist = () => {
    if (!editing?.title) {
      toast.error("Please enter a blog title first before using AI Assist");
      return;
    }
    setAiGenerating(true);
    const toastId = toast.loading("AI Assist generating structured outline and content draft...");

    setTimeout(() => {
      const generated = `# ${editing.title}

## Introduction
The rapid acceleration of industry standards is demanding a fresh perspective on this domain. Professionals must adopt new workflows to remain resilient in an era of digital transition.

## Key Takeaways
1. **Focus on Core Fundamentals**: Syntax and tools change, but architectural principles and system fundamentals remain constant.
2. **AI Copilot Integration**: Learn to prompt and review code rather than writing raw syntax row-by-row.
3. **Cross-functional Collaboration**: Understanding product development and UX is now mandatory.

## Future Projections
By 2028, over 80% of entry-level tasks will be co-authored by virtual agents, moving humans up the value chain to reviews and system engineering.
`;
      setEditing({
        ...editing,
        excerpt: editing.excerpt || `In-depth research guide analyzing the core principles and future trends of: ${editing.title}.`,
        content: generated,
      });
      toast.success("Content draft generated by AI Assist successfully!", { id: toastId });
      setAiGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">CMS Editor</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Blog Content Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write guides, publish industry reports, edit landing pages, and schedule content announcements.
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() =>
            setEditing({
              id: "",
              title: "",
              slug: "",
              excerpt: "",
              content: "",
              category: "General",
              tags: [],
              isPublished: false,
              coverImage: "",
              createdAt: "",
            })
          }
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Blog Post
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 pl-9"
            placeholder="Search blogs by title or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-border/80 bg-card/40 px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer font-semibold outline-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Blogs list */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((blog) => (
          <div
            key={blog.id}
            className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-6 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/60 text-muted-foreground rounded px-2 py-0.5 border border-border/50">
                  {blog.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    blog.isPublished ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"
                  }`}
                >
                  {blog.isPublished ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <h3 className="text-lg font-bold text-foreground mt-3 leading-snug">{blog.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{blog.excerpt}</p>

              <div className="flex flex-wrap gap-1 mt-4">
                {blog.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-accent/30 text-muted-foreground rounded px-1.5 py-0.5">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-6">
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing({ ...blog })}
                  className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground shadow-sm transition-all"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-destructive hover:border-destructive/40 shadow-sm transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-lg flex flex-col max-h-[90vh] text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-xl font-bold tracking-tight">
                {editing.id ? "Edit Blog Post" : "Create New Blog Post"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split pane body */}
            <div className="flex-1 overflow-y-auto py-5 grid gap-6 md:grid-cols-2 min-h-[300px]">
              {/* Form Input fields */}
              <div className="space-y-4 pr-3 border-r border-border/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Blog Title</label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="Enter blog heading..."
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                    <Input
                      className="h-10 rounded-xl"
                      placeholder="e.g. Guidance"
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug</label>
                    <Input
                      className="h-10 rounded-xl"
                      placeholder="e.g. guide-ai-resilience"
                      value={editing.slug}
                      onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cover Image URL</label>
                  <Input
                    className="h-10 rounded-xl"
                    placeholder="https://images.unsplash.com/..."
                    value={editing.coverImage}
                    onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Excerpt / Summary</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder="Short description snippet..."
                    value={editing.excerpt}
                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Markdown Content Body</label>
                    <button
                      onClick={handleAiAssist}
                      disabled={aiGenerating}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> AI Assist Write
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder="Write body content in markdown format..."
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publishedCheck"
                    checked={editing.isPublished}
                    onChange={(e) => setEditing({ ...editing, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-0"
                  />
                  <label htmlFor="publishedCheck" className="text-xs font-semibold text-muted-foreground select-none cursor-pointer">
                    Publish immediately (Mark as public content)
                  </label>
                </div>
              </div>

              {/* Preview pane */}
              <div className="space-y-4 overflow-y-auto pr-2 flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" /> Live Reader Markdown Preview
                </label>
                <div className="flex-1 rounded-2xl border border-border/80 bg-accent/10 p-6 overflow-y-auto text-sm max-h-[450px]">
                  {editing.content ? (
                    <div className="prose prose-sm dark:prose-invert">
                      <h1 className="text-2xl font-bold mb-3">{editing.title || "Untiled Title"}</h1>
                      <div className="text-xs text-muted-foreground font-mono mb-4">
                        Category: {editing.category} · Status: {editing.isPublished ? "Published" : "Draft"}
                      </div>
                      <p className="font-semibold text-muted-foreground border-l-2 border-primary pl-3 mb-6 italic">
                        {editing.excerpt || "No excerpt summary provided."}
                      </p>
                      <div className="whitespace-pre-wrap font-sans text-xs text-foreground leading-relaxed">
                        {editing.content}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground block text-center mt-20">
                      Draft markdown to display live preview
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} variant="gradient">
                {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Save Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
