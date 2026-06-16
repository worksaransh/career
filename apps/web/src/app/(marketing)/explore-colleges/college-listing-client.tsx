"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, MapPin, SlidersHorizontal, ChevronDown, ChevronUp, ExternalLink, GraduationCap, Building2, Banknote, TrendingUp, Users, Star, Loader2 } from "lucide-react";

interface CollegeSummary {
  id: string; name: string; slug: string; location: string;
  ranking: number; feesTotal: number; avgPackage: number;
  placementPercent: number; rating: number;
  topRecruiters: string[]; studentCount: number;
}

interface Props {
  colleges: CollegeSummary[];
  total: number;
  page: number;
  limit: number;
  query: string;
  location: string;
  sortBy: string;
  sortOrder: string;
  locations: string[];
}

export default function CollegeListingClient(props: Props) {
  const [colleges, setColleges] = useState(props.colleges);
  const [total, setTotal] = useState(props.total);
  const [page, setPage] = useState(props.page);
  const [query, setQuery] = useState(props.query);
  const [location, setLocation] = useState(props.location);
  const [sortBy, setSortBy] = useState(props.sortBy);
  const [sortOrder, setSortOrder] = useState(props.sortOrder);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [rankRange, setRankRange] = useState<[number, number]>([0, 9999]);
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 5000000]);
  const limit = props.limit;
  const totalPages = Math.ceil(total / limit);

  const fetchColleges = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (location) params.set("location", location);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      params.set("page", String(p));
      params.set("limit", String(limit));
      if (rankRange[0] > 0) params.set("minRank", String(rankRange[0]));
      if (rankRange[1] < 9999) params.set("maxRank", String(rankRange[1]));
      if (feeRange[0] > 0) params.set("minFee", String(feeRange[0]));
      if (feeRange[1] < 5000000) params.set("maxFee", String(feeRange[1]));

      const res = await fetch(`/api/colleges?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setColleges(json.data.colleges);
        setTotal(json.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [query, location, sortBy, sortOrder, limit, rankRange, feeRange]);

  useEffect(() => {
    setPage(1);
    fetchColleges(1);
  }, [query, location, sortBy, sortOrder, fetchColleges]);

  useEffect(() => {
    if (page !== 1) fetchColleges(page);
  }, [page, fetchColleges]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchColleges(1);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight">Colleges in India</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Search and compare {total.toLocaleString()}+ colleges across India
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges by name..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Locations</option>
              {props.locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </form>

        {showFilters && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Min Rank</label>
              <input type="number" value={rankRange[0]} onChange={(e) => setRankRange([Number(e.target.value), rankRange[1]])} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Max Rank</label>
              <input type="number" value={rankRange[1]} onChange={(e) => setRankRange([rankRange[0], Number(e.target.value)])} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1" placeholder="9999" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Min Fees</label>
              <input type="number" value={feeRange[0]} onChange={(e) => setFeeRange([Number(e.target.value), feeRange[1]])} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Max Fees</label>
              <input type="number" value={feeRange[1]} onChange={(e) => setFeeRange([feeRange[0], Number(e.target.value)])} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1" placeholder="5000000" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{total.toLocaleString()} colleges found</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort:</span>
            {["ranking", "name", "avgPackage", "feesTotal"].map((field) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === field ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                {field === "avgPackage" ? "Package" : field.charAt(0).toUpperCase() + field.slice(1)}
                {sortBy === field && (sortOrder === "asc" ? " ↑" : " ↓")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-24">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">No colleges found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <Link
                key={college.id}
                href={`/colleges/${college.slug}`}
                className="group rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{college.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {college.location}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-3 text-right">
                    <span className="text-xs text-muted-foreground">Rank</span>
                    <p className="font-bold text-lg leading-tight">#{college.ranking === 9999 ? "N/A" : college.ranking}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                    <div>
                      <p className="text-muted-foreground">Fees</p>
                      <p className="font-semibold">₹{(college.feesTotal / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    <div>
                      <p className="text-muted-foreground">Avg Package</p>
                      <p className="font-semibold">₹{(college.avgPackage / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-semibold">{college.rating > 0 ? college.rating.toFixed(1) : "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-purple-500" />
                    <div>
                      <p className="text-muted-foreground">Placement</p>
                      <p className="font-semibold">{college.placementPercent > 0 ? `${college.placementPercent}%` : "N/A"}</p>
                    </div>
                  </div>
                </div>

                {college.topRecruiters && college.topRecruiters.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {college.topRecruiters.slice(0, 3).map((r) => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{r}</span>
                    ))}
                    {college.topRecruiters.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">+{college.topRecruiters.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center text-xs text-primary font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ExternalLink className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-accent transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    page === pageNum ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:bg-accent transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
