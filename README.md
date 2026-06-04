# Forge landing page

A landing page for **Forge**, a (concept) hackathon-driven platform for innovation
programs, skills-based hiring, skill validation and AI capability building.

Built as a frontend screening exercise: a HackerRank-caliber marketing page,
themed to the hackathon / innovation domain, with a small real backend.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · zero UI libraries.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Requires Node 18.17+ (Next 14). Fonts are loaded via `next/font/google`, so the
first build needs internet access.

---

## The backend

A single route handler at `app/api/leads/route.ts` powers the "Request access"
form:

- `POST /api/leads` validates name, work email, organization and intent on the
  server, de-dupes by email, and returns `201` with an id (or `422` with
  per-field errors).
- `GET /api/leads` returns the current submission count (handy for a quick
  smoke test).

Validation lives in `lib/leads-store.ts`, separate from the transport layer.
Storage is an in-memory array to keep the demo dependency-free. The file is
commented to show exactly where you'd drop in Postgres/Prisma or a hosted KV for
production (the swap is one file and doesn't touch the route or the UI).

Quick check:

```bash
curl -X POST localhost:3000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@northbeam.com","organization":"Northbeam","intent":"company"}'
```

---

## Structure

```
app/
  layout.tsx          fonts + metadata
  page.tsx            composes the sections
  globals.css         design tokens, scroll-reveal utility
  api/leads/route.ts  POST + GET handlers
components/
  Navbar  Hero  Manifesto  Features
  HowItWorks  Faq  Waitlist  Footer
  Reveal.tsx          IntersectionObserver scroll reveals
  icons.tsx           inline SVG icon set + wordmark
lib/
  leads-store.ts      validation + in-memory store
```

## Notes on the design

- **Type:** Bricolage Grotesque (display) / Hanken Grotesk (body) / JetBrains
  Mono (labels & code), to avoid generic defaults.
- **Palette:** near-black ink + warm off-white, one acid-lime accent used
  sparingly. CSS variables + a small Tailwind token set keep it consistent.
- **Product mockups** are built in pure HTML/CSS (no screenshots), so nothing
  is a static image and everything is responsive.
- **Motion** is restrained: one staggered hero reveal plus subtle on-scroll
  fades, all disabled under `prefers-reduced-motion`.
Forge is a concept, so the page deliberately has no fake social proof: no
invented client logos, no made-up testimonials, no fabricated impact stats. The
sample data inside the product mockups is just that, placeholder UI to show what
the interface would look like.

Accessibility: semantic landmarks, labelled controls, visible keyboard focus
rings, `aria-invalid` on errored fields, and reduced-motion support.
