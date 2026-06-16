"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Banknote, TrendingUp, GraduationCap, Award, ChevronLeft, ChevronRight, Users, Calendar, ExternalLink, Building2, Shield, BookOpen, School } from "lucide-react";

interface CollegeDetail {
  id: string; name: string; slug: string; description: string;
  location: string; ranking: number; feesTotal: number;
  feesTuition: number; feesLiving: number; avgPackage: number;
  highestPackage: number; placementPercent: number;
  topRecruiters: string[]; rating: number; studentCount: number;
  establishedYear?: number; website?: string;
  images: Array<{ id: string; url: string; alt: string | null; type: string; isPrimary: boolean; source: string }>;
  locations: Array<{ id: string; address: string; city: string; state: string; type: string }>;
  rankings: Array<{ id: string; source: string; rank: number; score: number | null; year: number; category: string }>;
  collegeCourses: Array<{ id: string; course: { name: string; category: string; level: string; duration: string }; fees: number; seats: number | null }>;
  collegeDegrees: Array<{ id: string; degree: { name: string; type: string } }>;
  reviews: Array<{ id: string; rating: number; title: string; content: string; createdAt: string }>;
  scholarships: Array<{ id: string; name: string; amount: number; description: string | null }>;
}

interface Props {
  college: CollegeDetail;
}

export default function CollegeDetailClient({ college }: Props) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const images = college.images.length > 0 ? college.images : [{ id: "placeholder", url: `/api/college-image-placeholder?name=${encodeURIComponent(college.name)}&type=CAMPUS`, alt: college.name, type: "CAMPUS", isPrimary: true, source: "AI_GENERATED" }];

  const baseUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) ?? "https://careeros.ai";
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: college.name,
    description: college.description,
    url: `${baseUrl}/colleges/${college.slug}`,
    location: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: college.location } },
  };
  if (college.rating > 0) {
    jsonLd.aggregateRating = { "@type": "AggregateRating", ratingValue: college.rating, bestRating: 5 };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/colleges" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4" /> Back to Colleges
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {images.length > 0 && (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-accent">
                  <Image
                    src={images[currentImageIdx]?.url ?? ""}
                    alt={images[currentImageIdx]?.alt ?? college.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                    unoptimized
                  />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><ChevronLeft className="h-5 w-5" /></button>
                      <button onClick={() => setCurrentImageIdx((i) => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"><ChevronRight className="h-5 w-5" /></button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImageIdx(i)} className={`w-2 h-2 rounded-full ${i === currentImageIdx ? "bg-white" : "bg-white/50"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{college.name}</h1>
                    <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" /> {college.location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-muted-foreground">NIRF Rank</span>
                    <p className="text-3xl font-black text-primary">#{college.ranking === 9999 ? "N/A" : college.ranking}</p>
                  </div>
                </div>

                <p className="mt-4 text-muted-foreground leading-relaxed">{college.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <Banknote className="h-5 w-5 text-emerald-500 mb-1" />
                  <p className="text-2xl font-bold">₹{(college.feesTotal / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-muted-foreground">Total Fees</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <TrendingUp className="h-5 w-5 text-blue-500 mb-1" />
                  <p className="text-2xl font-bold">₹{(college.avgPackage / 100000).toFixed(1)}L</p>
                  <p className="text-xs text-muted-foreground">Avg Package</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <Star className="h-5 w-5 text-amber-500 mb-1" />
                  <p className="text-2xl font-bold">{college.rating > 0 ? college.rating.toFixed(1) : "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <Users className="h-5 w-5 text-purple-500 mb-1" />
                  <p className="text-2xl font-bold">{college.placementPercent > 0 ? `${college.placementPercent}%` : "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Placement</p>
                </div>
              </div>

              {college.rankings.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><Award className="h-5 w-5 text-primary" /> Rankings</h2>
                  <div className="space-y-2">
                    {college.rankings.map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <span className="font-semibold text-sm">{r.source}</span>
                          <span className="text-xs text-muted-foreground ml-2">{r.category} {r.year}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">#{r.rank}</span>
                          {r.score && <span className="text-xs text-muted-foreground ml-2">Score: {r.score}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {college.collegeCourses.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><BookOpen className="h-5 w-5 text-primary" /> Courses</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="pb-2 font-semibold">Course</th>
                          <th className="pb-2 font-semibold">Level</th>
                          <th className="pb-2 font-semibold">Duration</th>
                          <th className="pb-2 font-semibold text-right">Fees</th>
                        </tr>
                      </thead>
                      <tbody>
                        {college.collegeCourses.map((cc) => (
                          <tr key={cc.id} className="border-b border-border/50">
                            <td className="py-2.5 font-medium">{cc.course.name}</td>
                            <td className="py-2.5 text-muted-foreground">{cc.course.level}</td>
                            <td className="py-2.5 text-muted-foreground">{cc.course.duration}</td>
                            <td className="py-2.5 text-right font-semibold">₹{(cc.fees / 100000).toFixed(2)}L</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {college.collegeDegrees.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><GraduationCap className="h-5 w-5 text-primary" /> Degrees Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {college.collegeDegrees.map((cd) => (
                      <span key={cd.id} className="px-3 py-1.5 rounded-full bg-accent text-sm font-medium">{cd.degree.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {college.topRecruiters.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><Building2 className="h-5 w-5 text-primary" /> Top Recruiters</h2>
                  <div className="flex flex-wrap gap-2">
                    {college.topRecruiters.map((r) => (
                      <span key={r} className="px-3 py-1.5 rounded-full bg-accent text-sm">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {college.scholarships.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-primary" /> Scholarships</h2>
                  <div className="space-y-3">
                    {college.scholarships.map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                        </div>
                        <p className="font-bold text-sm">₹{(s.amount / 100000).toFixed(1)}L</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {college.reviews.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-bold text-lg flex items-center gap-2 mb-4"><Star className="h-5 w-5 text-primary" /> Student Reviews</h2>
                  <div className="space-y-4">
                    {college.reviews.map((r) => (
                      <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold">?</div>
                          <span className="font-medium text-sm">Anonymous</span>
                          <div className="flex items-center gap-0.5 ml-auto">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? "text-amber-500 fill-amber-500" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        {r.title && <p className="font-semibold text-sm">{r.title}</p>}
                        <p className="text-sm text-muted-foreground mt-0.5">{r.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
                <h3 className="font-bold text-sm mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Established</span><span className="font-medium">{college.establishedYear ?? "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Students</span><span className="font-medium">{college.studentCount > 0 ? college.studentCount.toLocaleString() : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Highest Package</span><span className="font-medium">₹{college.highestPackage > 0 ? `${(college.highestPackage / 100000).toFixed(1)}L` : "N/A"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tuition Fees</span><span className="font-medium">₹{(college.feesTuition / 100000).toFixed(1)}L</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Living Fees</span><span className="font-medium">₹{(college.feesLiving / 100000).toFixed(1)}L</span></div>
                </div>

                {college.locations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide">Locations</h4>
                    {college.locations.map((l) => (
                      <div key={l.id} className="flex items-start gap-2 text-sm mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{l.address}</p>
                          <p className="text-xs text-muted-foreground">{l.city}, {l.state}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <ExternalLink className="h-4 w-4" /> Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
