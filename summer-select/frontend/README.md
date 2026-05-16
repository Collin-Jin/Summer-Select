# Summer Select — Frontend

A production-grade, bilingual (EN / 中文) web application for discovering, evaluating, and tracking high-school summer research programs. Built with **Next.js 16 App Router**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Backend / Auth | Supabase (PostgreSQL + Supabase Auth) |
| Icons | Lucide React |
| Date utils | date-fns |
| Class utilities | clsx + tailwind-merge |

---

## Prerequisites

- Node.js 18+
- A Supabase project with the `summer_programs`, `profiles`, and `favorites` tables (see schema below)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd summer-select/frontend
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=<your-publishable-anon-key>
```

> **Never** expose the `service_role` key in a client-side environment variable.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

### Required tables

The project connects to a Supabase PostgreSQL database with the following tables:

#### `summer_programs`
The core program directory. See `lib/database.types.ts` for the full column reference.
- **Primary key:** `lid` (UUID)
- **RLS:** `SELECT` restricted to authenticated users whose `profiles.is_paid = true`

#### `profiles`
One row per `auth.user`. Stores payment status.
- **Primary key:** `id` (FK → `auth.users.id`)
- **Key column:** `is_paid BOOLEAN DEFAULT false`

#### `favorites`
User-saved bookmarks linking users to programs.

```sql
CREATE TABLE favorites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_manage_own_favorites ON favorites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                    # Root layout (metadata, fonts, global styles)
│   ├── globals.css                   # Tailwind imports + CSS variables
│   ├── not-found.tsx                 # Global 404 page
│   ├── login/
│   │   ├── page.tsx                  # Sign In / Sign Up page
│   │   └── actions.ts                # Server Actions for auth
│   ├── paywall/
│   │   └── page.tsx                  # Upsell page for unpaid users
│   └── dashboard/
│       ├── layout.tsx                # Auth gate + LanguageProvider + AppLayout
│       ├── page.tsx                  # Main program directory (Server Component)
│       ├── error.tsx                 # Per-segment error boundary
│       ├── program/[slug]/
│       │   ├── page.tsx              # Program detail page
│       │   └── ProgramDetailFavoriteButton.tsx
│       ├── my-list/
│       │   ├── page.tsx
│       │   └── MyListClientView.tsx
│       ├── essays/
│       │   └── page.tsx              # Example essays (static, accordion)
│       └── interviews/
│           └── page.tsx              # Interview prep (static, accordion)
├── components/
│   ├── ui/
│   │   ├── Badge.tsx                 # Color-coded label pills
│   │   ├── Button.tsx                # Multi-variant button
│   │   ├── Card.tsx                  # Card container
│   │   ├── EmptyState.tsx            # Empty list state
│   │   ├── ErrorBoundary.tsx         # React class error boundary
│   │   └── Spinner.tsx               # Loading spinner
│   ├── layout/
│   │   ├── AppLayout.tsx             # Navbar + content wrapper
│   │   └── Navbar.tsx                # Top nav with language toggle
│   └── programs/
│       ├── CollinIndexBadge.tsx      # Score gauge (compact + full variants)
│       ├── FavoriteButton.tsx        # Heart toggle with optimistic updates
│       ├── FilterPanel.tsx           # Search, filter, sort sidebar
│       ├── ProgramCard.tsx           # Card shown in dashboard grid + My List
│       └── ProgramsClientView.tsx    # Client wrapper for dashboard filtering
├── context/
│   └── LanguageContext.tsx           # EN/ZH toggle + t() column helper
├── data/
│   ├── essays.ts                     # 5 example essays (bilingual)
│   └── interviews.ts                 # 2 program interview guides (bilingual)
├── lib/
│   ├── database.types.ts             # Full TypeScript schema definitions
│   ├── favorites.ts                  # Client-side favorites CRUD
│   └── programs.ts                   # Server-side program fetching functions
└── utils/
    ├── formatDate.ts                 # Date formatting utilities (JSDoc)
    ├── formatFinancial.ts            # Financial formatting utilities (JSDoc)
    └── supabase/
        ├── client.ts                 # Browser Supabase singleton
        └── server.ts                 # Server Supabase client (cookie-based)
```

---

## Authentication & Access Control

```
/login              → Public (Supabase Auth)
    ↓ login success
/dashboard/layout   → Checks: authenticated? → else /login
                      Checks: profiles.is_paid? → else /paywall
    ↓ paid user
/dashboard          → Program directory
/dashboard/program/[slug]
/dashboard/my-list
/dashboard/essays
/dashboard/interviews
```

Row-Level Security enforces the `is_paid` check at the database level — the `summer_programs` table RLS policy blocks unpaid users from reading any program data even if they bypass the UI redirect.

---

## Bilingual Support

The app supports English and Chinese throughout. Language state is managed by `LanguageContext`:

- Toggle persists to `localStorage` and a `lang` cookie
- The cookie allows Server Components to render the correct language on first load
- The `t(base)` helper appends `_en` or `_zh` to any bilingual column base name

```typescript
const { lang, setLang, t } = useLanguage();
// t('name') → 'name_en' | 'name_zh'
// program[t('name')] → localized program name
```

---

## Key Features

| Feature | Implementation |
|---|---|
| Program directory (50 programs) | Server fetch → client-side filter/sort |
| Search | Full-text over name + institution (EN + ZH) |
| Filters | Category, format, grade, financial aid, stipend, international |
| Sort | Collin Index, deadline, tuition, acceptance rate |
| Collin Index | Circular SVG gauge (1–10) with color tiers |
| Favorites | Optimistic UI, persisted to Supabase `favorites` table |
| My List | Server-fetched favorites → client-side remove |
| Example Essays | 5 programs, bilingual, accordion layout |
| Interview Prep | 2 programs, tips + sample answers, bilingual |
| Language toggle | Cookie-persisted, server + client aware |
| Auth gate | Server Component redirect in `dashboard/layout.tsx` |

---

## Suggested Git Commit Flow

Following the granular plan, each phase maps to a clean commit:

```
feat: initialize Next.js + Tailwind project and install dependencies
feat: add Supabase client and TypeScript database type definitions
feat: implement auth gate in dashboard layout (is_paid check)
feat: add bilingual LanguageContext with EN/ZH toggle
feat: add date and financial formatting utilities
feat: implement server-side program fetching services and favorites CRUD
feat: build reusable UI component library (Button, Badge, Card, Spinner)
feat: build AppLayout with responsive Navbar and language toggle
feat: implement Login/Signup page with server actions
feat: add upsell/paywall page for unpaid users
feat: build main dashboard with FilterPanel, ProgramCard grid, search and sort
feat: build program detail page with Collin Index section
feat: implement My List page with favorites management
feat: add Example Essays static content page
feat: add Interview Prep static content page
feat: add error boundaries, 404 page, and production polish
```

---

## Development Notes

- **Server vs Client Components**: Data fetching is done in Server Components (`lib/programs.ts`). Client Components are used for interactivity (filters, favorites, language toggle). This follows Next.js App Router best practices.
- **No external state manager**: Auth and language state use React Context. The app scale (50 programs) doesn't warrant Zustand or Redux.
- **RLS is the security layer**: The UI redirects are a UX convenience. The actual data gate is enforced by Supabase Row-Level Security policies.
