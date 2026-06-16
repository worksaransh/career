# Career OS — AI Career Operating System

> **See Your Future Before You Decide.**

A production-grade SaaS platform that combines AI-powered career matching, college and degree intelligence, salary forecasting, roadmap generation, and more — designed to scale to millions of users.

## Architecture

```
career-os/
├── apps/
│   └── web/                    # Next.js 14 App Router (Landing + Web App + API)
│       ├── src/
│       │   ├── app/            # Routes (Marketing, App, Auth, Admin, API)
│       │   ├── components/     # UI, Layouts, Marketing, Auth, Dashboard, Admin
│       │   ├── lib/            # DB, Auth, AI, Rate-limit, Audit, Encryption
│       │   ├── hooks/          # Custom React hooks
│       │   ├── providers/      # Theme, Auth, Analytics providers
│       │   ├── styles/         # Global CSS, design tokens
│       │   ├── types/          # TypeScript type definitions
│       │   └── validations/    # Zod schemas
│       └── __tests__/          # Unit, Integration, E2E, A11y tests
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   ├── validations/            # Shared Zod schemas
│   ├── config/                 # Shared configuration
│   └── ui/                     # Shared component variants
└── tooling/
    ├── eslint/                 # Shared ESLint config
    ├── typescript/             # Shared TypeScript config
    └── prettier/               # Shared Prettier config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS + Radix UI + Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Google, GitHub, Email, OTP, Phone) |
| Validation | Zod |
| Forms | React Hook Form + @hookform/resolvers |
| PWA | @serwist/next |
| i18n | next-intl (English, Hindi, Hinglish) |
| Payments | Stripe |
| Testing | Vitest + Playwright + axe-core |
| Monorepo | Turborepo + pnpm |
| Security | Rate limiting, CSP, CSRF, AES-256-GCM encryption, Audit logging |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Set up database
pnpm db:generate
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth.js secret (min 32 chars)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `OPENAI_API_KEY` — OpenAI for AI features
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Payments
- `REDIS_URL` — Redis for rate limiting & caching

## Key Features

### Phase 1-3: Foundation & Marketing
- Landing page with hero, features, pricing, testimonials, stats, FAQ, CTA sections
- Glassmorphism design system with dark/light mode, soft shadows, micro-interactions
- SEO optimized with structured data, sitemap, robots.txt, Open Graph
- Responsive navigation with mobile drawer, dropdowns, sticky header
- Marketing pages: About, Pricing, Features, Blog, Career/College/Degree/Skills/Scholarship Explorer
- PWA with install prompt, offline page, manifest, service worker
- Error/loading/not-found states, skeleton loaders, empty states

### Phase 4: Authentication & Onboarding
- Google, GitHub OAuth + Email/Password + OTP + Phone ready
- 5-step progressive onboarding (welcome → goal → interests → education → complete)
- Profile completeness tracking (10% → 25% → 47% → 63% → 89% → 100%)
- Session management with JWT, role-based access control

### Phase 5-15: Core App Features
- AI Career Matching engine (backend hooks ready)
- Career GPS roadmap generation
- College & Degree intelligence with ROI analysis
- Future Simulator (compare two paths)
- Parent Dashboard with ROI calculator
- Skills & Certifications recommendations
- Premium PDF reports
- Consumer dashboard with widgets

### Phase 16-23: Admin & Enterprise
- RBAC with 8 roles (Super Admin through Moderator)
- CMS for managing careers, degrees, colleges, content, media, SEO
- Analytics event tracking
- Monetization (Free/Premium/School/University tiers + coupons + referrals)
- Notification engine (email/push/in-app) with preferences
- Full audit logging, consent tracking, encryption
- Rate limiting per endpoint

### Phase 24-27: Infrastructure
- Versioned API routes
- Unit tests (Vitest), E2E tests (Playwright), A11y tests (axe-core)
- Lighthouse >95 targets, Core Web Vitals optimized
- Edge caching ready, code splitting, image optimization
- Architecture hooks for Android/iOS apps, AI mentor, job marketplace

## Design System

The platform uses a comprehensive design system with:

- **Design Tokens**: CSS custom properties for colors, typography, spacing, shadows
- **Theme**: Full light/dark mode via `next-themes` with smooth transitions
- **Glassmorphism**: `glass`, `glass-strong`, `glass-light` utility classes
- **Components**: Button, Card, Input, Badge, Avatar, Progress, Skeleton, GlassCard, Separator, AnimatedContainer, EmptyState
- **Animations**: Framer Motion for page transitions, micro-interactions, hover effects
- **Typography**: Inter (sans), Calistoga (display), JetBrains Mono (mono) via next/font

## Security

- **Content Security Policy** — Strict CSP headers
- **Rate Limiting** — Per-endpoint with Redis
- **Encryption** — AES-256-GCM for sensitive data
- **Audit Logging** — All admin/user actions logged
- **Consent Management** — DPDP-ready privacy controls
- **Session Management** — JWT with configurable expiry
- **CSRF/XSS** — Built-in Next.js protections + CSP
- **HTTP Headers** — HSTS, X-Frame-Options, X-Content-Type-Options

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm format` | Format code with Prettier |

## License

Private — All rights reserved.
