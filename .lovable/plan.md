## Goal
Ship the P0/P1 audit items in sequenced phases. Each phase is independently shippable and verifiable. We'll execute phase-by-phase, confirming after each.

## Phase 1 — Persistent Plans + Tokenized Email Links (fixes the 404)
**Why first:** Unblocks the email "Open My Plan + PDF" button, removes sessionStorage dependency, and lays the foundation for everything else.

- DB: `plans` table (`share_token uuid pk`, `email`, `inputs jsonb`, `outputs jsonb`, `pdf_url text`, `created_at`, `updated_at`). RLS: anon SELECT by token only; service-role INSERT/UPDATE.
- DB: `plan_events` table for view/open analytics (token, event, ua, ip_hash, ts).
- Edge function `save-plan`: validates inputs (zod), generates `share_token`, upserts row, returns `{ token, url }`.
- Edge function `get-plan`: returns plan by token (rate-limited, 200ms cache).
- `BodyRecompWizard` → on completion calls `save-plan`, stores token in URL (`/results/:token`), sessionStorage becomes cache only.
- `Results.tsx` → reads `:token` param, hydrates from `get-plan`, falls back to sessionStorage.
- `brevo-subscribe` → accepts `shareToken`, stores on contact attribute `PLAN_TOKEN`, all email templates use `{{ contact.PLAN_TOKEN }}` in CTA URLs.
- Brevo templates: update Day-0/Day-2/etc. CTA links to `https://gearuptofit.com/fitness-plan/results/{{ contact.PLAN_TOKEN }}?utm_source=email&utm_campaign=drip&utm_content=day{{N}}`.
- `InlineEmailCapture` / `EmailGate` → pass `shareToken` to subscribe call, single source of truth via shared hook `useEmailCapture`.

## Phase 2 — Server-side PDF + Storage
- Storage bucket `plan-pdfs` (private, signed-url access).
- Edge function `generate-plan-pdf`: renders premium PDF (Puppeteer-free, using `@react-pdf/renderer` in Deno or HTML→PDF via Browserless). Returns signed URL, stores `pdf_url`.
- Trigger from `save-plan` (async, non-blocking).
- Welcome email gets the signed PDF URL via `params.PDF_URL`.

## Phase 3 — Email Drip Hardening
- Idempotency: unique index `email_drip_log (contact_email, day_offset)`.
- One-click unsubscribe header (`List-Unsubscribe`, `List-Unsubscribe-Post`) in every send.
- Plain-text alternative for every template (Brevo template editor or `textContent` param).
- Engagement-based throttling: skip Day N if previous 2 emails unopened (query `email_engagement_events`).
- Preview text per template.
- Rate-limit `brevo-subscribe` (10/min/IP via Deno KV or Supabase).

## Phase 4 — Trust + Conversion Polish
- Real coach bio component (`Alex` — photo, credentials, 1-line story) on Results + landing.
- Citations as expandable footnotes on `ScienceTab`.
- Press logos / social proof strip on `Index`.
- 3 testimonials (placeholder copy, swap later).
- Money-back / guarantee microcopy near CTA.

## Phase 5 — Performance + SEO
- Drop font weights to 2 (Oswald 700, Inter 400/600).
- Lazy-load Recharts via `React.lazy` on Results tabs.
- Convert hero/section images to AVIF + WebP fallback.
- Dynamic `sitemap.xml` (Vite plugin + `seo-pages.ts`).
- `BreadcrumbList` JSON-LD on plans + tools.
- Internal linking block on each programmatic page (3 related plans + 2 tools).
- Unique 60-word intro per programmatic page (template-driven, not duplicated).

## Phase 6 — Security
- Run `supabase--linter`, fix all findings.
- Rotate `BREVO_WEBHOOK_SECRET` + verify HMAC on `brevo-webhook`.
- CSP meta tag in `index.html`.
- Zod validation on all edge function inputs.
- Review RLS: ensure anon can read `plans` ONLY by exact token match.

## Phase 7 (Optional / Future) — Auth + Next.js
- Email/password + Google auth via Lovable Cloud.
- `useDailyStreak` → server-backed `user_streaks` table.
- Cross-device plan history.
- Next.js App Router migration (separate large workstream — recommend doing after #1-6 ship).

---

## Execution model
I'll execute Phase 1 in this turn (the 404 fix is critical), then stop and let you greenlight Phase 2. Each subsequent phase is one focused turn so we never break a working state.

## Technical notes
- All edge functions: zod validation, CORS, error logging, idempotency keys.
- All new tables: RLS-first design, deny-all default, explicit policies.
- All new components: semantic design tokens (no raw colors).
- No business logic changes to calculation formulas — purely additive.
