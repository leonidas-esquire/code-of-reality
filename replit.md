# Code of Reality — E₈ RealityMastery Platform™

**Ascendancy Technologies | Leonidas Esquire Williamson**

A full-stack consciousness engineering platform guiding practitioners through 8 phases of reality transformation across 42 chapters, with AI coaching powered by Claude, E₈ sacred geometry visualization, and multi-dimensional coherence analytics.

---

## Architecture

pnpm workspace monorepo. All deployable apps live in `artifacts/`, shared code in `lib/`.

| Package | Purpose |
|---|---|
| `artifacts/code-of-reality` | React + Vite frontend (Sacred Geometric Futurism UI) |
| `artifacts/api-server` | Express 5 API server (all backend routes) |
| `lib/db` | Drizzle ORM schema + PostgreSQL migrations |
| `lib/api-spec` | OpenAPI spec (`openapi.yaml`) — source of truth |
| `lib/api-client-react` | Generated React Query hooks (from OpenAPI via Orval) |
| `lib/integrations-anthropic-ai` | Anthropic AI client via Replit integration proxy |

---

## Stack

- **Runtime**: Node.js 24, pnpm workspaces
- **Frontend**: React 19, Vite 7, Tailwind CSS, Wouter routing, React Query
- **Backend**: Express 5, pino logging, JWT auth (bcryptjs + jsonwebtoken)
- **Database**: PostgreSQL + Drizzle ORM + pgvector extension
- **AI**: Anthropic Claude (via Replit AI integration proxy — `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY`)
- **API Contract**: OpenAPI → Orval codegen → React Query hooks + Zod schemas
- **Auth**: JWT stored in `localStorage` under key `cor_token`; Bearer token on all API requests

---

## Platform Features

### 8 Transformation Phases
1. Awakening → 2. Clearing → 3. Mapping → 4. Crystallizing → 5. Weaving → 6. Transmitting → 7. Mastering → 8. Transcending

### 42 Chapters
Fully seeded with opening paragraphs, summaries, quotables, and linked tools across all 8 phases.

### Pages (14 total)
- `/` — Command Center dashboard (E₈ visualization background, reality metrics)
- `/auth` — Sacred initiation login/register ("INITIALIZE SEQUENCE")
- `/onboarding` — Multi-step dimensional assessment wizard
- `/phases` — 8-phase journey map with phase gates
- `/chapters/:id` — Immersive chapter reading + reflection journal
- `/assessment` — D3 radar chart dimensional scan tool
- `/intentions` — Intention architecture + constellation view
- `/identity` — Identity geometry + coherence audit
- `/journal` — Personal journal with AI prompt integration
- `/sessions` — Practice session logger + streak tracker
- `/community` — Phase-gated forum threads and posts
- `/analytics` — Transformation timeline + dimension trends (Recharts)
- `/ai-coach` — Claude AI coach with streaming SSE responses
- `/achievements` — Achievement gallery

### E₈ Visualization
Pure HTML5 Canvas implementation (240 rotating roots with glow, bloom simulation, and edge detection). Replaces `@react-three/fiber` which is incompatible with React 19.

---

## Database Schema (Drizzle)

| Table | Purpose |
|---|---|
| `users` | Accounts with phase, subscription tier, streak |
| `assessments` | 8-dimensional scan results |
| `reality_vectors` | Computed reality vector (8D) per assessment |
| `pattern_locks` | Behavioral pattern locks with status/resolution |
| `intentions` | Intention structures with crystallization score |
| `intention_constellations` | Groups of harmonically aligned intentions |
| `identity_geometries` | Identity geometry snapshots + coherence gaps |
| `chapters` | 42 chapters of content across 8 phases |
| `chapter_progress` | Per-user chapter completion + reflection data |
| `journal_entries` | Personal journal linked to chapters |
| `sessions` | Practice sessions with pre/post scoring |
| `achievements` | Achievement definitions |
| `user_achievements` | Per-user earned achievements |
| `forum_threads` | Community discussion threads |
| `forum_posts` | Thread posts |
| `conversations` | AI coach conversation sessions |
| `messages` | AI coach messages (user + assistant) |

---

## API Routes

All routes under `/api/`:

| Route Group | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` |
| Users | `GET/PUT /users/me`, `POST /users/me/onboarding` |
| Assessments | `GET/POST /assessments`, `GET /assessments/latest`, `GET /assessments/:id` |
| Vectors | `GET /vectors`, `GET /vectors/current`, `GET /vectors/trajectory` |
| Patterns | `GET /patterns`, `PUT /patterns/:id/status` |
| Intentions | Full CRUD + `POST /intentions/:id/crystallize` |
| Constellations | `GET/POST /constellations`, `GET /constellations/:id` |
| Identity | `GET/POST /identity`, `GET /identity/coherence-audit` |
| Chapters | `GET /chapters`, `GET /chapters/:id`, `POST /chapters/:id/complete`, `GET /chapters/progress` |
| Phases | `GET /phases`, `GET /phases/current`, `POST /phases/:phase/advance` |
| Journal | Full CRUD on `/journal` |
| Sessions | `GET/POST /sessions`, `GET /sessions/stats` |
| Achievements | `GET /achievements` |
| Community | Threads + posts + `GET /community/resonance` |
| Analytics | `GET /analytics/dimensions`, `GET /analytics/summary` |
| AI Coach | `GET/POST /anthropic/conversations`, `GET/POST /anthropic/conversations/:id/messages` (SSE streaming) |

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing secret |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Replit Anthropic proxy base URL |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Replit Anthropic proxy API key |

---

## Key Commands

```bash
# Regenerate API hooks + Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes to PostgreSQL
pnpm --filter @workspace/db run push

# Full typecheck
pnpm run typecheck

# Install packages
pnpm install
```

---

## Design System

**Sacred Geometric Futurism**
- `#00D4FF` — Electric cyan (primary interactive, data)
- `#D4A843` — Deep gold (sacred geometry, achievements)
- `#7B2FBE` — Violet (transcendent states, phase 8)
- Fonts: Cormorant Garamond (display), DM Sans (UI), JetBrains Mono (data)
- No rounded SaaS cards — angular geometric borders, crystalline surfaces
- Deep space void backgrounds with particle/geometry patterns
