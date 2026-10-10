# Summer Select

A bilingual (English / 中文) web app for finding, comparing and preparing applications to competitive high-school summer programs. A public Program Directory is open to everyone, a free account adds Collin's application analysis and a saved list, and paid members also get example essays, interview guides and an AI essay evaluator. The site owner can edit all content directly on the live site.

## What it does

- **Program Directory** (public): search, filter and sort summer programs by format, grade, cost, financial aid, stipend and deadline. Each program has a detail page and a "Collin Index" selectivity score. Collin's written analysis and strategy are shown to signed-in users; guests see a blurred preview.
- **Free account**: Collin's analysis and application strategy on every program, and "My List", an application planner: a timeline of every saved program's deadlines for the current admission cycle (August to August), the closest deadline with a countdown, star ratings, private notes that autosave, an application status tracker, and calendar (.ics) export with reminders. Removing a program asks for confirmation because it also deletes the rating and notes.
- **Full access** (paid): example essays grouped by program and prompt, interview guides with tips, and an AI essay evaluator. Guests and free accounts who open these pages see a blurred preview with a sign-up or upgrade prompt.
- **AI essay evaluator**: embeds the student's draft with OpenAI, retrieves the three most similar reference essays from a pgvector table, and asks a chat model for structured feedback grounded in them.
- **Accounts**: e-mail and password sign-up with verification and password reset (Supabase Auth). Access is `guest`, `unpaid` (a free account) or `paid`; an optional one-device-per-account lock is enforced for members.
- **Owner tools**:
  - **Edit mode**: a floating toggle that adds edit, add, delete and drag-to-reorder controls to the real pages, with an in-page editor drawer.
  - **`/admin`**: table views for programs, essay prompts, example essays, interview guides and questions, AI reference essays, and member access management.
  - **Originals** (admin only): the untouched version of each example essay next to the privacy-edited one members see.
- **Bilingual UI**: language is cookie-backed so server components render the right language on first paint.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Data and auth | Supabase (Postgres, Row-Level Security, Auth) via `@supabase/ssr` |
| AI | OpenAI embeddings and chat completions; pgvector for retrieval |
| Drag and drop | `@dnd-kit` |
| Tests | Vitest |
| CI | GitHub Actions |
| Hosting | Vercel |

## Architecture

```
Browser ──► proxy.ts ──► Server Components / Server Actions / Route Handlers ──► Supabase
              │                      │                                            (Postgres + RLS)
              │                      └──► OpenAI (essay evaluator, reference-essay embeddings)
              └─ refreshes the auth session on every request; sends guests away from members-only routes
```

Security is layered, and the database is the source of truth:

1. **`proxy.ts`** refreshes the Supabase session on every request (Server Components cannot write cookies) and redirects guests away from members-only routes.
2. **Pages** enforce the next level: My List redirects guests to log in, Essays, Evaluate and Interviews render a blurred `LockedFeature` preview unless the viewer has paid, paid members see an "in development" notice on Evaluate while `EVALUATOR_IN_DEVELOPMENT` in `lib/features.ts` is true (the `/api/evaluate` route returns 503 too), and `app/admin/layout.tsx` requires the admin.
3. **Row-Level Security** is what actually protects the data. Essay and interview tables are readable only by paid users, program analysis is exposed to signed-in users through a read-only view, admin writes require `public.is_admin()`, and the originals table is admin-only. The admin e-mail in `lib/admin/config.ts` must match `public.is_admin()` in the database.

The admin area is registry-driven: `lib/admin/resources.ts` describes each editable table once (fields, form layout, list columns, relations), and the lists, forms, validation and server actions are generated from it. Adding a column means adding one field entry.

## Repository layout

```
.
├── .github/workflows/ci.yml        Lint, type-check, test and build
└── summer-select/frontend/         The Next.js application
    ├── app/                        Routes
    │   ├── page.tsx                  Landing page (guests)
    │   ├── login/, reset-password/,  Auth pages and server actions
    │   │   auth/
    │   ├── dashboard/                Program Directory (public), plus my-list (free account),
    │   │                             essays / interviews / evaluate (paid, blurred preview otherwise), originals (admin)
    │   ├── admin/                    Owner content editor and member management
    │   └── api/                      evaluate, session-validate, force-signout
    ├── components/                 UI by feature: admin, auth, landing, layout, paywall, programs, ui
    ├── context/                    Language (EN/ZH) context
    ├── lib/                        Server and shared logic
    │   ├── admin/                    Resource registry, validation, auth, data access
    │   ├── supabase/                 Browser and server clients
    │   ├── format/                   Date and money formatting
    │   └── access.ts, viewer.ts, …   Access rules, current-viewer lookup, programs and favorites queries
    ├── proxy.ts                    Session refresh and route protection
    ├── supabase/                   SQL migrations (see supabase/README.md)
    └── public/                     Static assets
```

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A Supabase project (see [`summer-select/frontend/supabase/README.md`](summer-select/frontend/supabase/README.md) for the schema it expects)
- An OpenAI API key (only needed for the essay evaluator and for adding AI reference essays)

### Setup

```bash
git clone https://github.com/CollinJin2029LikesToCode/Summer-Select.git
cd Summer-Select/summer-select/frontend
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables

Defined in [`.env.example`](summer-select/frontend/.env.example). Never commit `.env.local`.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_KEY` | public | Supabase publishable (anon) key. Never use the `service_role` key here. |
| `NEXT_PUBLIC_APP_URL` | public | App origin, used for auth e-mail redirects |
| `OPENAI_API_KEY` | server only | Essay evaluator and reference-essay embeddings |

In Supabase, under Authentication, URL Configuration, allow the redirect URLs `<APP_URL>/auth/callback`, `/auth/confirmed`, `/reset-password` and `/reset-password/success` for both your production origin and `http://localhost:3000`.

### Scripts

Run from `summer-select/frontend`:

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |

## Testing

Unit tests live next to the code (`lib/**/*.test.ts`) and cover the access rules and open-redirect guard, form validation for every admin field type, registry integrity, and the date and money formatters. CI runs lint, type-check, tests and a production build on every push to `main` and on pull requests.

There are no browser or end-to-end tests yet, and the Supabase policies and functions are not covered by automated tests.

## Deployment

The app is deployed on Vercel. Because the Next.js app is in a subdirectory, set the project's **Root Directory** to `summer-select/frontend`, and define the four environment variables above for the Production environment.

## Contributing and license

This is a personal project and no license has been specified. For changes, open a pull request; CI must pass. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).
