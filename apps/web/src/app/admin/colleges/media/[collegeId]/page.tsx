"use client";

import React, { useState, useEffect } from "react";
import { Image, Star, Upload, X, Loader2, Trash2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

interface CollegeImage {
  id: string;
  url: string;
  alt: string | null;
  type: string;
  isPrimary: boolean;
  source: string;
  width: number;
  height: number;
  createdAt: string;
}

const IMAGE_TYPES = ["LOGO", "CAMPUS", "AERIAL", "LIBRARY", "LAB", "SPORTS", "HOSTEL", "CLASSROOM", "OTHER"];

export default function AdminCollegeMediaPage() {
  const params = useParams();
  const collegeId = params.collegeId as string;
  const [images, setImages] = useState<CollegeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeName, setCollegeName] = useState("");
  const [newImage, setNewImage] = useState({ url: "", alt: "", type: "CAMPUS", isPrimary: false, source: "UPLOADED" as string });
  const [adding, setAdding] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    try {
      const [imgRes, colRes] = await Promise.all([
        fetch(`/api/colleges/${collegeId}/images`),
        fetch(`/api/colleges/${collegeId}`),
      ]);
      const imgJson = await imgRes.json();
      const colJson = await colRes.json();
      if (imgJson.success) setImages(imgJson.data);
      if (colJson.success) setCollegeName(colJson.data.name);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (collegeId) loadImages(); }, [collegeId]);

  const handleAddImage = async () => {
    if (!newImage.url.trim()) {
      toast.error("Image URL is required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/colleges/${collegeId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newImage),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Image added");
        setNewImage({ url: "", alt: "", type: "CAMPUS", isPrimary: false, source: "UPLOADED" });
        loadImages();
      } else {
        toast.error(json.error?.message ?? "Failed to add image");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setAdding(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`/api/colleges/${collegeId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...images.find((i) => i.id === imageId), isPrimary: true }),
      });
      if (res.ok) {
        toast.success("Primary image updated");
        loadImages();
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const generateAIImage = () => {
    const name = collegeName || "College";
    const type = newImage.type || "CAMPUS";
    setNewImage((prev) => ({
      ...prev,
      url: `/api/college-image-placeholder?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
      source: "AI_GENERATED",
      alt: `${name} ${type.toLowerCase()} view`,
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">College Media</span>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1">{collegeName || "Loading..."}</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage images for this college. Replace AI-generated images with licensed or uploaded ones.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Add New Image</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Image URL</label>
            <input
              type="text"
              value={newImage.url}
              onChange={(e) => setNewImage((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Alt Text</label>
            <input
              type="text"
              value={newImage.alt}
              onChange={(e) => setNewImage((prev) => ({ ...prev, alt: e.target.value }))}
              placeholder="Descriptive alt text"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Image Type</label>
            <select
              value={newImage.type}
              onChange={(e) => setNewImage((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {IMAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Source</label>
            <select
              value={newImage.source}
              onChange={(e) => setNewImage((prev) => ({ ...prev, source: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="UPLOADED">Uploaded</option>
              <option value="AI_GENERATED">AI Generated</option>
              <option value="LICENSED">Licensed</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={newImage.isPrimary}
              onChange={(e) => setNewImage((prev) => ({ ...prev, isPrimary: e.target.checked }))}
              className="rounded border-border"
            />
            Set as primary image
          </label>
          <button onClick={generateAIImage} className="text-xs text-primary hover:underline ml-auto">
            Generate AI placeholder
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAddImage}
            disabled={adding}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {adding ? "Adding..." : "Add Image"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Images ({images.length})</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <Image className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No images yet. Add your first image above.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl border border-border overflow-hidden bg-accent">
                <div className="aspect-video relative">
                  <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{img.type}</span>
                    <div className="flex items-center gap-1">
                      {img.isPrimary && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                      <span className="text-[10px] text-muted-foreground">{img.source.replace("_", " ")}</span>
                    </div>
                  </div>
                  {img.alt && <p className="text-xs text-muted-foreground mt-1 truncate">{img.alt}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {!img.isPrimary && (
                      <button onClick={() => handleSetPrimary(img.id)} className="text-xs text-primary hover:underline">
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
