# E₈ RealityMastery Platform™

**Ascendancy Technologies — Leonidas Esquire Williamson**

A full-stack consciousness engineering platform guiding practitioners through **8 phases of reality transformation** across **42 chapters**, with an AI reality coach powered by Claude, E₈ sacred geometry visualization, multi-dimensional coherence analytics, community forums, and a subscription paywall.

**Live:** https://reality-code-engine--leonidasesquire.replit.app

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Repository Structure](#repository-structure)
5. [Platform Features](#platform-features)
6. [Transformation Journey](#transformation-journey)
7. [Pages & Routes](#pages--routes)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Subscription Tiers & Paywall](#subscription-tiers--paywall)
11. [Design System](#design-system)
12. [Environment Variables](#environment-variables)
13. [Local Development](#local-development)
14. [Key Commands](#key-commands)
15. [Deployment](#deployment)
16. [Connecting Stripe Payments](#connecting-stripe-payments)

---

## Platform Overview

The Code of Reality platform operationalises a structured personal transformation curriculum. Practitioners complete dimensional assessments, track behavioral pattern locks, architect intentions, maintain a reflection journal, log practice sessions, engage the community, and receive real-time AI coaching — all within a single coherent experience built on rigorous geometry, symbolic language, and phase-gated progression.

The platform is a pnpm monorepo. The frontend is a React + Vite SPA. The backend is an Express 5 API server. All API contracts are defined in OpenAPI first, then code-generated into React Query hooks and Zod schemas. The PostgreSQL database is managed by Drizzle ORM.

---

## Architecture

```
artifacts-monorepo/
├── artifacts/
│   ├── code-of-reality/    # React + Vite SPA (Sacred Geometric Futurism UI)
│   └── api-server/         # Express 5 REST API
├── lib/
│   ├── db/                 # Drizzle ORM schema + migrations (PostgreSQL)
│   ├── api-spec/           # OpenAPI spec — single source of truth
│   ├── api-client-react/   # Generated React Query hooks (via Orval)
│   ├── api-zod/            # Generated Zod validation schemas (via Orval)
│   ├── integrations/       # Shared integration utilities
│   └── integrations-anthropic-ai/  # Anthropic Claude client (Replit proxy)
├── scripts/                # Utility scripts (seed-products, post-merge sync)
├── pnpm-workspace.yaml     # Workspace package catalog + overrides
└── tsconfig.base.json      # Shared strict TypeScript defaults
```

A global reverse proxy routes traffic by path:

| Path | Service |
|------|---------|
| `/api/*` | `artifacts/api-server` |
| `/*` | `artifacts/code-of-reality` |

Paths are **not** rewritten — services handle their full base path.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 24, pnpm workspaces |
| Frontend | React 19, Vite 7, Tailwind CSS 4, Wouter 3 routing |
| Component Library | Radix UI primitives + shadcn/ui patterns |
| Data Fetching | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod |
| Animations | Framer Motion, GSAP 3 |
| Charts | Recharts 2, D3 7 |
| Audio | Howler.js, Tone.js |
| State | Zustand 5 |
| Backend | Express 5 |
| Logging | Pino 9 + pino-http (structured JSON) |
| Auth | JWT (`jsonwebtoken`) + bcryptjs — stored in `localStorage` as `cor_token` |
| Database | PostgreSQL + Drizzle ORM + pgvector |
| AI | Anthropic Claude via Replit AI integration proxy |
| Payments | Stripe SDK 22 + `stripe-replit-sync` |
| API Contract | OpenAPI → Orval codegen → React Query hooks + Zod schemas |

---

## Repository Structure

### `artifacts/code-of-reality` — Frontend SPA

```
src/
├── pages/              # 17 route pages
├── components/
│   ├── ui/             # Radix/shadcn UI primitives
│   ├── auth-provider.tsx       # JWT token context + React Query auth
│   ├── layout.tsx              # App shell, sidebar, nav
│   ├── e8-visualization.tsx    # HTML5 Canvas E₈ Lie group renderer
│   ├── radar-chart.tsx         # D3 8-dimension assessment radar
│   ├── paywall-gate.tsx        # Subscription tier enforcement (frontend)
│   └── error-boundary.tsx      # React error boundary (catch render crashes)
├── lib/
│   └── utils.ts        # clsx/tailwind-merge helpers
├── App.tsx             # Router, ErrorBoundary wrapper
└── main.tsx            # React root mount
```

### `artifacts/api-server` — Backend API

```
src/
├── routes/             # One file per resource domain
│   ├── auth.ts         # Register, login, logout
│   ├── users.ts        # Profile + onboarding
│   ├── assessments.ts  # 8-dimensional scans
│   ├── vectors.ts      # Reality vector computation
│   ├── patterns.ts     # Behavioral pattern locks
│   ├── intentions.ts   # Intention architecture + crystallization
│   ├── identity.ts     # Identity geometry + coherence audit
│   ├── chapters.ts     # 42-chapter curriculum (phase-gated)
│   ├── phases.ts       # Phase progression (tier-gated at phase 5)
│   ├── journal.ts      # Personal reflection journal
│   ├── sessions.ts     # Practice sessions + streaks
│   ├── achievements.ts # Achievement gallery
│   ├── community.ts    # Forum threads + posts
│   ├── analytics.ts    # Dimension trends + summary
│   ├── anthropic.ts    # AI coach (SSE streaming, ARCHITECT+)
│   ├── billing.ts      # Stripe checkout, portal, subscription sync
│   └── health.ts       # GET /api/healthz
├── middleware/         # JWT auth middleware
└── index.ts            # Express app entry point
```

### `lib/db` — Database

```
src/
├── index.ts            # Drizzle client (singleton, exported as `db`)
└── schema/             # One file per domain
    ├── users.ts
    ├── assessments.ts
    ├── vectors.ts
    ├── patterns.ts
    ├── intentions.ts
    ├── chapters.ts
    ├── identity.ts
    ├── journal.ts
    ├── sessions.ts
    ├── achievements.ts
    ├── community.ts
    ├── conversations.ts
    └── messages.ts
```

### `lib/api-spec` — OpenAPI Contract

Single `openapi.yaml` is the source of truth. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate all React Query hooks and Zod schemas. Never edit generated files manually.

---

## Platform Features

### E₈ Sacred Geometry Visualization
Pure HTML5 Canvas renderer displaying all 240 roots of the E₈ Lie group in real time. Features rotation, glow layers, bloom simulation, and edge intensity detection. Renders as a full-bleed background on the Command Center dashboard.

### 8-Dimensional Assessment Engine
Radar chart (D3) scanning eight reality dimensions:
`Consciousness · Energy · Alignment · Pattern · Expression · Connection · Manifestation · Integration`

Scores are stored as `reality_vectors` and used to compute trajectory analytics over time.

### Intention Architecture
Create, crystallize, and group intentions into harmonic constellations. Each intention has a category, crystallization score, and resonance data.

### Behavioral Pattern Locks
Log limiting behavioral patterns with status tracking (`active → processing → resolved`). Tied to chapter content and journal reflections.

### Identity Geometry
Snapshot-based identity geometry capturing dominant archetypes, coherence score, and integration gaps. Coherence audit computes delta across snapshots.

### 42-Chapter Curriculum
Seeded content across all 8 phases — opening paragraphs, summaries, quotables, and linked reflection tools. Chapters are phase-gated server-side; phases 5–8 require ARCHITECT tier. Chapter completion triggers `chapter_progress` records and can unlock achievements.

### Practice Session Logger
Log practice sessions by type with pre/post state scoring and notes. Session stats include streaks, total hours, and session-type breakdowns.

### Reflection Journal
Personal journal with AI prompt integration. Entries are linked optionally to chapters, intentions, and sessions.

### Community Forums
Phase-gated forum threads and posts. The `GET /api/community/resonance` endpoint returns community-wide coherence metrics.

### AI Reality Coach
Streaming conversation with Anthropic Claude. Sessions are persisted as `conversations` + `messages` in the database. Requires ARCHITECT or CERTIFIED tier. Enforced server-side on every request.

### Analytics Dashboard
Transformation timeline, dimension trend charts (Recharts), and summary statistics. `GET /api/analytics/dimensions` returns time-series data per dimension. `GET /api/analytics/summary` returns aggregate metrics.

### Achievement System
Pre-defined achievement definitions with per-user unlock records. Displayed in a full achievement gallery page.

---

## Transformation Journey

### 8 Phases

| Phase | Title | Chapters |
|-------|-------|---------|
| 1 | Awakening | 1–5 |
| 2 | Clearing | 6–10 |
| 3 | Mapping | 11–15 |
| 4 | Crystallizing | 16–21 |
| 5 | Weaving *(ARCHITECT)* | 22–27 |
| 6 | Transmitting *(ARCHITECT)* | 28–33 |
| 7 | Mastering *(ARCHITECT)* | 34–38 |
| 8 | Transcending *(ARCHITECT)* | 39–42 |

Phase advancement is gated by chapter completion percentage. Phases 5–8 are additionally gated behind the ARCHITECT subscription tier.

---

## Pages & Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Command Center | Dashboard with E₈ visualization, reality metrics, phase status |
| `/auth` | Sacred Initiation | Login / register — "INITIALIZE SEQUENCE" |
| `/onboarding` | Dimensional Assessment | Multi-step wizard capturing baseline 8-dimension scores |
| `/phases` | Phase Pathway | 8-phase journey map, phase gates, ARCHITECT badges for phases 5–8 |
| `/chapters/:id` | Chapter Reader | Immersive chapter content, reflection journal, progress tracking |
| `/guide` | Platform Guide | Scrollable orientation guide with Mark as Read CTA |
| `/assessment` | Dimensional Scan | D3 radar chart assessment tool |
| `/intentions` | Intention Architecture | Create/manage intentions and constellations |
| `/identity` | Identity Geometry | Identity snapshots and coherence audit |
| `/journal` | Reflection Journal | Personal journal with AI prompt prompts |
| `/sessions` | Practice Sessions | Session logger, streak tracker, session stats |
| `/community` | Community Forum | Phase-gated threads and posts |
| `/analytics` | Analytics | Transformation timeline, dimension trend charts |
| `/ai-coach` | AI Reality Coach | Streaming Claude conversation *(ARCHITECT+)* |
| `/achievements` | Achievements | Full achievement gallery |
| `/pricing` | Sacred Pricing | Subscription tiers with Stripe checkout |
| `/billing/success` | Billing Success | Post-checkout subscription sync |

---

## API Reference

All routes are mounted under `/api/`. JWT Bearer token required on all routes except `/api/auth/*` and `/api/healthz`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create account (returns JWT) |
| `POST` | `/api/auth/login` | Authenticate (returns JWT) |
| `POST` | `/api/auth/logout` | Invalidate session |

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users/me` | Fetch current user profile |
| `PUT` | `/api/users/me` | Update profile |
| `POST` | `/api/users/me/onboarding` | Submit onboarding assessment |

### Assessments & Vectors

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/assessments` | List all assessments |
| `POST` | `/api/assessments` | Submit new assessment |
| `GET` | `/api/assessments/latest` | Most recent assessment |
| `GET` | `/api/assessments/:id` | Single assessment |
| `GET` | `/api/vectors` | All reality vectors |
| `GET` | `/api/vectors/current` | Current reality vector |
| `GET` | `/api/vectors/trajectory` | Vector trajectory over time |

### Patterns

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/patterns` | List pattern locks |
| `PUT` | `/api/patterns/:id/status` | Update pattern status |

### Intentions & Constellations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/intentions` | List intentions |
| `POST` | `/api/intentions` | Create intention |
| `PUT` | `/api/intentions/:id` | Update intention |
| `DELETE` | `/api/intentions/:id` | Delete intention |
| `POST` | `/api/intentions/:id/crystallize` | Trigger crystallization |
| `GET` | `/api/constellations` | List constellations |
| `POST` | `/api/constellations` | Create constellation |
| `GET` | `/api/constellations/:id` | Single constellation |

### Identity

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/identity` | List identity geometry snapshots |
| `POST` | `/api/identity` | Create snapshot |
| `GET` | `/api/identity/coherence-audit` | Compute coherence delta |

### Chapters & Phases

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/chapters` | List all chapters (metadata) |
| `GET` | `/api/chapters/:id` | Chapter content *(phase-gated)* |
| `POST` | `/api/chapters/:id/complete` | Mark chapter complete |
| `GET` | `/api/chapters/progress` | All chapter progress for user |
| `GET` | `/api/phases` | List all phases |
| `GET` | `/api/phases/current` | User's current phase |
| `POST` | `/api/phases/:phase/advance` | Advance to next phase *(tier-gated at phase 5)* |

### Journal

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/journal` | List journal entries |
| `POST` | `/api/journal` | Create entry |
| `PUT` | `/api/journal/:id` | Update entry |
| `DELETE` | `/api/journal/:id` | Delete entry |

### Sessions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/sessions` | List practice sessions |
| `POST` | `/api/sessions` | Log new session |
| `GET` | `/api/sessions/stats` | Streak + aggregate stats |

### Community

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/community/threads` | List forum threads |
| `POST` | `/api/community/threads` | Create thread |
| `GET` | `/api/community/threads/:id/posts` | List posts in thread |
| `POST` | `/api/community/threads/:id/posts` | Reply to thread |
| `GET` | `/api/community/resonance` | Community coherence metrics |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/analytics/dimensions` | Time-series data per dimension |
| `GET` | `/api/analytics/summary` | Aggregate transformation metrics |

### Achievements

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/achievements` | All achievements + unlock status for user |

### AI Coach *(ARCHITECT+ only)*

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/anthropic/conversations` | List conversations |
| `POST` | `/api/anthropic/conversations` | Create conversation |
| `GET` | `/api/anthropic/conversations/:id/messages` | List messages |
| `POST` | `/api/anthropic/conversations/:id/messages` | Send message (SSE streaming response) |

### Billing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/billing/products` | List Stripe products |
| `GET` | `/api/billing/subscription` | Current subscription status |
| `POST` | `/api/billing/checkout` | Create Stripe Checkout session |
| `POST` | `/api/billing/portal` | Create Stripe Customer Portal session |
| `POST` | `/api/billing/sync` | Sync subscription status after checkout |
| `POST` | `/api/stripe/webhook` | Stripe webhook receiver (raw body) |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Returns `{"status":"ok"}` |

---

## Database Schema

Managed by Drizzle ORM. Apply schema changes with `pnpm --filter @workspace/db run push`.

| Table | Key Fields |
|-------|-----------|
| `users` | `id`, `email`, `passwordHash`, `currentPhase`, `subscriptionTier`, `streak`, `onboardingComplete` |
| `assessments` | `id`, `userId`, `type`, `scores` (8-dim JSON), `createdAt` |
| `reality_vectors` | `id`, `userId`, `assessmentId`, `vector` (float[8]) |
| `pattern_locks` | `id`, `userId`, `name`, `status` (active/processing/resolved), `description` |
| `intentions` | `id`, `userId`, `title`, `category`, `crystallizationScore`, `constellationId` |
| `intention_constellations` | `id`, `userId`, `name`, `resonanceScore` |
| `identity_geometries` | `id`, `userId`, `archetypes`, `coherenceScore`, `integrationGaps` |
| `chapters` | `id`, `phase`, `order`, `title`, `content`, `summary`, `quotable` |
| `chapter_progress` | `id`, `userId`, `chapterId`, `completedAt`, `reflectionData` |
| `journal_entries` | `id`, `userId`, `content`, `chapterId?`, `intentionId?`, `sessionId?` |
| `sessions` | `id`, `userId`, `type`, `preScore`, `postScore`, `durationMinutes`, `notes` |
| `achievements` | `id`, `title`, `description`, `criteria`, `iconKey` |
| `user_achievements` | `id`, `userId`, `achievementId`, `earnedAt` |
| `forum_threads` | `id`, `userId`, `title`, `phase?`, `pinned` |
| `forum_posts` | `id`, `userId`, `threadId`, `content` |
| `conversations` | `id`, `userId`, `title`, `createdAt` |
| `messages` | `id`, `conversationId`, `role` (user/assistant), `content`, `createdAt` |

### Enums

| Enum | Values |
|------|--------|
| `subscription_tier` | `FREE`, `EXPLORER`, `ARCHITECT`, `CERTIFIED` |
| `assessment_type` | `initial`, `checkpoint`, `deep_dive` |
| `pattern_status` | `active`, `processing`, `resolved` |
| `intention_category` | `vision`, `relationship`, `health`, `abundance`, `purpose`, `growth`, `service`, `transcendence` |
| `session_type` | `meditation`, `visualization`, `breathwork`, `movement`, `journaling`, `study`, `integration` |

---

## Subscription Tiers & Paywall

| Tier | Access | Price |
|------|--------|-------|
| `FREE` | Phases 1–4 (chapters 1–21), community | $0/mo |
| `ARCHITECT` | Phases 1–8 (all 42 chapters) + AI Reality Coach | $49/mo |
| `CERTIFIED` | Everything + certification + masterminds + 1:1 sessions | $99/mo |

Enforcement is applied at **three layers**:

1. **Server-side route guards** — `routes/phases.ts` blocks advancement to phase 5+ without ARCHITECT. `routes/chapters.ts` blocks phase 5–8 content. `routes/anthropic.ts` blocks all AI coach endpoints for FREE users.
2. **Frontend PaywallGate** — `components/paywall-gate.tsx` wraps protected pages and shows an upgrade prompt.
3. **Frontend phase badges** — The Phases page renders ARCHITECT lock badges on phases 5–8 for FREE users.

---

## Design System

**Sacred Geometric Futurism** — a design language merging sacred geometry, crystalline architecture, and deep-space aesthetics.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Electric Cyan | `#00D4FF` | Primary interactive, data, links |
| Deep Gold | `#D4A843` | Sacred geometry, achievements, premium |
| Violet | `#7B2FBE` | Transcendent states, Phase 8, AI coach |
| Obsidian | `#0A0A0F` | Primary background (deep space void) |
| Crystal White | `#F0F4FF` | Primary text |

### Typography

| Role | Font |
|------|------|
| Display / headings | Cormorant Garamond |
| UI / body | DM Sans |
| Data / code | JetBrains Mono |

### Principles

- No rounded SaaS cards — angular geometric borders and crystalline surfaces throughout
- Deep space void backgrounds with particle and geometry patterns
- All interactive states use glow and shimmer, not shadows
- Data visualizations use the full E₈ color vocabulary

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Replit) |
| `SESSION_SECRET` | Yes | JWT signing secret |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Yes | Replit Anthropic proxy base URL |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Yes | Replit Anthropic proxy API key |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key (if not using Replit Stripe integration) |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret |
| `GITHUB_PAT` | Optional | GitHub PAT with `repo` scope for auto-sync on merge |

Secrets are managed via Replit Secrets (never committed to source).

---

## Local Development

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL (or use Replit's built-in database)

### Setup

```bash
# Install all workspace dependencies
pnpm install

# Push database schema to PostgreSQL
pnpm --filter @workspace/db run push

# Generate React Query hooks + Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

### Running Services

The project uses Replit Workflows to manage services. Each service requires its own env vars (`PORT`, `BASE_PATH`).

```bash
# API server (default port 8080, base path /api)
PORT=8080 BASE_PATH=/api pnpm --filter @workspace/api-server run dev

# Frontend SPA (default port 5173, base path /)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/code-of-reality run dev
```

In Replit, services are started automatically by the configured workflows.

---

## Key Commands

```bash
# Full TypeScript type check across all packages
pnpm run typecheck

# Type check libs only (faster, composite build)
pnpm run typecheck:libs

# Regenerate API hooks + Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes to PostgreSQL (non-destructive)
pnpm --filter @workspace/db run push

# Build the frontend for production
PORT=21808 BASE_PATH=/ pnpm --filter @workspace/code-of-reality run build

# Build the API server for production
pnpm --filter @workspace/api-server run build

# Seed Stripe products (ARCHITECT + CERTIFIED)
pnpm --filter @workspace/scripts run seed-products

# Validate post-merge hook is configured correctly
bash scripts/validate-post-merge-hook.sh
```

---

## Deployment

The platform is deployed on Replit. Publishing creates a production environment available at:

```
https://reality-code-engine--leonidasesquire.replit.app
```

The production build is a static Vite SPA (`artifacts/code-of-reality/dist/public`) served by Replit's static file host, with the API server running as a separate service behind the same reverse proxy.

### GitHub Sync

Every merged task automatically syncs to GitHub via the `[postMerge]` hook in `.replit`, which runs `scripts/post-merge.sh`. This script:

1. Fetches `github/main`
2. Rebases local commits on top of GitHub if there are new upstream commits
3. Pushes `HEAD → main` to `github.com/leonidas-esquire/code-of-reality`

Requires `GITHUB_PAT` secret set in Replit Secrets with `repo` scope.

---

## Connecting Stripe Payments

Stripe is integrated at the code level but requires activation:

1. Open the **Integrations** tab in Replit and connect the Stripe integration (`ccfg_stripe_01K611P4YQR0SZM11XFRQJC44Y`)
2. Restart the API server — it will auto-run Stripe schema migrations and webhook setup
3. Run `pnpm --filter @workspace/scripts run seed-products` to create ARCHITECT ($49/mo) and CERTIFIED ($99/mo) products in Stripe

Alternatively, set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` manually in Replit Secrets to use your own keys.

---

## License

Proprietary — Ascendancy Technologies. All rights reserved.
