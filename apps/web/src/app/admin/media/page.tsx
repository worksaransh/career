"use client";

import React, { useState } from "react";
import { Folder, Image, FileText, Video, Search, Upload, Plus, X, Tag, Settings, ArrowLeftRight, Check } from "lucide-react";
import toast from "react-hot-toast";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf";
  size: string;
  folder: string;
  alt: string;
}

const INITIAL_FILES: MediaFile[] = [
  { id: "media-1", name: "hero-marketing-banner.png", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe", type: "image", size: "1.4 MB", folder: "Marketing Banners", alt: "Corporate team software engineering GPS guidance" },
  { id: "media-2", name: "curriculum-outline-BCA.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", type: "pdf", size: "340 KB", folder: "Degrees Brochures", alt: "BCA syllabus curriculum outlines" },
  { id: "media-3", name: "iit-campus-tour.mp4", url: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video", size: "14.2 MB", folder: "Colleges Tours", alt: "IIT campus aerial video tour" },
];

export default function AdminMediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>(INITIAL_FILES);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("ALL");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  // Folder paths list
  const folders = ["ALL", "Marketing Banners", "Degrees Brochures", "Colleges Tours"];

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === "ALL" || f.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleUploadClick = () => {
    const nameInput = prompt("Enter simulated filename to upload (e.g. college-placements.png):");
    if (!nameInput) return;

    const extension = nameInput.split(".").pop()?.toLowerCase();
    let type: "image" | "video" | "pdf" = "image";
    if (extension === "pdf") type = "pdf";
    else if (extension === "mp4" || extension === "avi") type = "video";

    const newFile: MediaFile = {
      id: `media-${Date.now()}`,
      name: nameInput,
      url: type === "image" ? "https://images.unsplash.com/photo-1523050854058-8df90110c9f1" : "https://www.w3schools.com/html/mov_bbb.mp4",
      type,
      size: "820 KB",
      folder: activeFolder === "ALL" ? "Marketing Banners" : activeFolder,
      alt: "Uploaded media asset reference description",
    };

    setFiles([newFile, ...files]);
    toast.success("Simulated file uploaded, compressed, and metadata indexed!");
  };

  const handleSaveAlt = (newAlt: string) => {
    if (!selectedFile) return;
    setFiles(files.map((f) => (f.id === selectedFile.id ? { ...f, alt: newAlt } : f)));
    setSelectedFile({ ...selectedFile, alt: newAlt });
    toast.success("SEO Alternative tags updated!");
  };

  const handleSimulateCompression = () => {
    if (!selectedFile) return;
    toast.loading("Compressing asset while keeping original URL path...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Original image compressed by 64%! URL remains unchanged.");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-foreground">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">Asset Manager</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse directory folders, upload image files, configure SEO alt tags, and compress asset sizes.
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/95 shadow-sm transition-all"
        >
          <Upload className="h-4 w-4" /> Upload File
        </button>
      </div>

      {/* Explorer Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar Folder list */}
        <div className="md:col-span-1 rounded-2xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-sm space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Folders</h3>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeFolder === f 
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Folder className="h-4 w-4" />
              {f}
            </button>
          ))}
        </div>

        {/* Assets Main block */}
        <div className="md:col-span-3 space-y-4">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card/30 pl-10 pr-4 py-2.5 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-4 transition-all text-foreground"
            />
          </div>

          {/* Files grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {filteredFiles.length === 0 ? (
              <div className="sm:col-span-3 text-center text-xs text-muted-foreground py-16 border border-dashed border-border rounded-2xl">
                No files found in directory folder.
              </div>
            ) : (
              filteredFiles.map((file) => {
                const Icon = file.type === "image" ? Image : file.type === "pdf" ? FileText : Video;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/40 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full rounded-xl bg-accent/40 flex items-center justify-center overflow-hidden border border-border/50 relative">
                      {file.type === "image" ? (
                        <img src={file.url} alt={file.alt} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="font-bold text-xs truncate text-foreground">{file.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                        <span>{file.size}</span>
                        <span>{file.type.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Media Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4 text-foreground">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold">Media Properties</h3>
                <span className="text-[10px] text-muted-foreground font-mono">{selectedFile.id}</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl bg-accent/40 flex items-center justify-center overflow-hidden border border-border">
              {selectedFile.type === "image" ? (
                <img src={selectedFile.url} alt={selectedFile.alt} className="h-full w-full object-contain" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-muted-foreground">{selectedFile.name}</p>
                </div>
              )}
            </div>

            {/* Editing attributes */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SEO Alt Tag text</label>
                <input
                  type="text"
                  value={selectedFile.alt}
                  onChange={(e) => handleSaveAlt(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-accent/20 p-3 rounded-xl border border-border/40 font-mono text-muted-foreground">
                <div>Path: <span className="text-foreground text-[10px] block truncate">{selectedFile.url}</span></div>
                <div>Size: <span className="text-foreground block">{selectedFile.size}</span></div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border mt-2">
                <button
                  onClick={handleSimulateCompression}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-all"
                >
                  <Settings className="h-4 w-4" /> Compress File Size
                </button>
                <button
                  onClick={() => {
                    setFiles(files.filter(f => f.id !== selectedFile.id));
                    setSelectedFile(null);
                    toast.success("Media deleted successfully");
                  }}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
