import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const method = req.method;

    // Paths that are always public (no auth required)
    const publicPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify",
      "/api/auth",
    ];

    const isPublic = publicPaths.some((p) => path.startsWith(p));

    const isPublicApi =
      (path === "/api/analytics/track" && method === "POST") ||
      (path === "/api/college-image-placeholder" && method === "GET") ||
      (path === "/api/contact" && method === "POST") ||
      (path === "/api/explorer" && method === "GET") ||
      (path === "/api/feature-flags" && method === "GET") ||
      (path === "/api/search" && method === "POST") ||
      (path === "/api/outcomes" && method === "GET") ||
      (path === "/api/simulator/monte-carlo" && method === "POST") ||
      (path === "/api/comparisons" && method === "POST") ||
      (path === "/api/explainability" && method === "GET") ||
      (path === "/api/colleges" && method === "GET") ||
      (path === "/api/courses" && method === "GET") ||
      (path === "/api/editorial" && method === "GET") ||
      (/^\/api\/editorial\/[^/]+$/.test(path) && method === "GET") ||
      (/^\/api\/colleges\/[^/]+$/.test(path) && method === "GET") ||
      (/^\/api\/colleges\/[^/]+\/images$/.test(path) && method === "GET") ||
      (/^\/api\/colleges\/[^/]+\/rankings$/.test(path) && method === "GET");

    // Authenticated app routes — these require login
    const protectedPrefixes = [
      "/dashboard",
      "/assessments",
      "/careers",
      "/roadmap",
      "/mentor",
      "/degrees",
      "/simulator",
      "/skills",
      "/certifications",
      "/reports",
      "/parents",
      "/saved",
      "/settings",
      "/help",
      "/profile",
      "/onboarding",
      "/comparisons",
      "/privacy-center",
      "/weekly-intel",
      "/admin",
    ];

    const isProtected =
      protectedPrefixes.some((p) => path === p || path.startsWith(p + "/")) ||
      path === "/colleges";

    // API routes (except /api/auth) need auth
    const isApiRoute =
      path.startsWith("/api") && !path.startsWith("/api/auth") && !isPublicApi;

    // Marketing pages: everything that is NOT protected, NOT api, NOT public auth pages
    const isMarketing = !isProtected && !isApiRoute && !isPublic;

    // Let marketing pages through freely
    if (isMarketing) return NextResponse.next();

    // If no token and trying to access protected route, redirect to login
    if (!token && (isProtected || isApiRoute)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If authenticated user visits login/register, redirect to dashboard
    if (token && isPublic) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin role check
    if (path.startsWith("/admin")) {
      const allowedRoles = [
        "SUPER_ADMIN",
        "ADMIN",
        "CONTENT_MANAGER",
        "ANALYST",
        "FINANCE",
        "MODERATOR",
      ];
      if (!allowedRoles.includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts|locales|manifest.json|sw.js|robots.txt|sitemap.xml).*)",
  ],
};
