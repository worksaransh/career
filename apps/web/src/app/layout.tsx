import type { Metadata, Viewport } from "next";
import { Inter, Calistoga, JetBrains_Mono } from "next/font/google";

import "@/styles/globals.css";
import { Providers } from "@/providers";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/components/shared/seo";
import { AnalyticsWrapper } from "@/components/shared/analytics-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const calistoga = Calistoga({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cal",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const appName = "Career OS";
const appDescription = "AI-powered career guidance platform. See your future before you decide.";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://careeros.ai";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} — See Your Future Before You Decide`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "career guidance",
    "AI career advisor",
    "career assessment",
    "college finder",
    "degree planner",
    "career roadmap",
    "salary forecast",
    "career matching",
  ],
  authors: [{ name: "Career OS" }],
  creator: "Career OS",
  publisher: "Career OS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: appName,
    title: `${appName} — See Your Future Before You Decide`,
    description: appDescription,
    url: appUrl,
    images: [
      {
        url: "/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — See Your Future Before You Decide`,
    description: appDescription,
    images: ["/images/og-image.svg"],
    creator: "@careeros",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": appName,
    "msapplication-TileColor": "#6366f1",
    "theme-color": "#6366f1",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema()),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <AnalyticsWrapper>{children}</AnalyticsWrapper>
        </Providers>
      </body>
    </html>
  );
}
