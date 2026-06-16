import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const publicPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify",
      "/api/auth",
    ];

    const isPublic = publicPaths.some((p) => path.startsWith(p));
    const isMarketing =
      !path.startsWith("/app") &&
      !path.startsWith("/admin") &&
      !path.startsWith("/dashboard") &&
      !path.startsWith("/api") &&
      !isPublic;

    if (isMarketing) return NextResponse.next();

    if (!token && !isPublic) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && isPublic) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (path.startsWith("/admin")) {
      const allowedRoles = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "ANALYST"];
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
