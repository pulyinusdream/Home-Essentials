# Home Essentials Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Supabase-backed affiliate publishing platform in which authorized staff can create and publish products and buying guides that appear immediately on the public Home Essentials website, with safe Amazon redirects and click analytics.

**Architecture:** A Next.js 16 App Router application uses Server Components for reads, Server Actions for authenticated mutations, Supabase SSR for cookie sessions, PostgreSQL RLS for authoritative access control, Storage for media, and service modules for all queries. Public content and the admin CMS share DTOs and validation; `/go/[slug]` is the only outbound affiliate redirect boundary.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui, Lucide React, Zod, Supabase PostgreSQL/Auth/Storage, `@supabase/ssr`, `@supabase/supabase-js`, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-08-home-essentials-platform-design.md`

## Global Constraints

- Preserve the existing static deliverable; implement in the separate `work/home-essentials` application and export a clean source deliverable later.
- No checkout, cart, inventory, orders, payments, public registration, fake commerce data, fake reviews/ratings, or Amazon scraping.
- Preserve verified affiliate URLs exactly; validate HTTPS Amazon US hosts and never accept a visitor-supplied redirect destination.
- Enforce every privileged action through both server-side role checks and RLS; never expose a service-role key to browser code.
- Server Components are the default; client components exist only for local form state, interactive editors, dialogs, and navigation.
- Public prices render only from compliant API data verified within 24 hours; otherwise hide the price.
- Every public and administrative page includes accessible focus, keyboard behavior, responsive layouts, and honest loading/empty/error states.
- Use the supplied warm cream, charcoal, gold, muted gray, Playfair Display, and Inter system; Lucide icons only and no emojis.
- This workspace has no existing Git repository. Initialize a local repository and feature branch before implementation; commits are local only.

## Review Focus

- A malicious affiliate URL with credentials, a deceptive Amazon-like hostname, HTTP, or a nonstandard port must be rejected before storage and redirect.
- An editor must never promote themselves, manage users, or change administrator-only security/legal settings through either UI or direct Data API calls.
- A draft, archived record, inactive category, or product without an active link must never expose a public purchase action.
- A failed database or Storage mutation must keep entered form data and report the error without a success state.
- A price older than 24 hours or not sourced from the approved API path must not render publicly.

---

### Task 1: Framework, quality harness, and design foundation

**Files:**
- Modify: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`
- Create: `vitest.config.ts`, `playwright.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/loading.tsx`, `src/components/shared/*`, `PRODUCT.md`, `DESIGN.md`, `.env.example`
- Test: `src/lib/__tests__/environment.test.ts`, `tests/smoke/public-shell.spec.ts`

**Interfaces:**
- Produces: typed `getPublicEnv(): PublicEnv | null`, shared tokens, `PageShell`, `EmptyState`, `ErrorState`, and the test/build commands used by all later tasks.

- [ ] Write environment and shell smoke tests first; verify they fail because the new modules/routes do not exist.
- [ ] Convert the starter from Vinext/Cloudflare scripts to ordinary Next.js `dev`, `build`, and `start`; add Supabase and test dependencies.
- [ ] Implement strict environment parsing that never returns secret values to client code and allows build-time missing-config states.
- [ ] Implement global metadata, typography, tokens, focus, reduced-motion rules, and shared loading/empty/error surfaces.
- [ ] Run unit tests, lint, typecheck, and production build; commit `chore: establish platform foundation`.

### Task 2: PostgreSQL schema, RLS, Storage, and seed

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, `003_storage_setup.sql`, `004_functions_and_triggers.sql`, `005_indexes.sql`, `supabase/seed.sql`, `src/types/database.types.ts`, `docs/database-setup.md`
- Test: `tests/database/schema.test.ts`, `supabase/tests/rls.test.sql`

**Interfaces:**
- Produces: required tables plus `media_assets`; enums/checks, foreign keys, indexes, updated-at triggers, role helpers, public policies, staff policies, storage policies, category seed, and TypeScript `Database` types.
- Consumes: environment names and timestamp/slug conventions from Task 1.

- [ ] Write schema-contract tests that assert every table, constraint, RLS enablement, grant, policy class, trigger, and seven seed categories; verify RED.
- [ ] Implement migration 001 with UUID defaults, publication checks, safe delete behavior, structured content, compliant price fields, and analytics attribution fields.
- [ ] Implement role helpers and least-privilege grants/RLS; add pgTAP-style tests for anon, editor, and admin behavior.
- [ ] Implement Storage bucket and object policies with staff-only writes and public reads.
- [ ] Implement timestamps, activity-log functions, indexes, and seed data.
- [ ] Add generated-compatible database types and setup docs; run contract tests and, if a local Supabase runtime exists, reset and execute SQL tests; commit `feat: add secured Supabase foundation`.

### Task 3: Supabase SSR authentication and authorization

**Files:**
- Create: `src/lib/supabase/client.ts`, `server.ts`, `proxy.ts`, `src/lib/auth/require-user.ts`, `require-role.ts`, `permissions.ts`, `src/app/admin/login/page.tsx`, `actions.ts`, `src/app/admin/(protected)/layout.tsx`, `src/components/admin/admin-shell.tsx`, `src/proxy.ts`, `docs/first-admin.md`
- Test: `src/lib/auth/__tests__/permissions.test.ts`, `tests/auth/admin-access.spec.ts`

**Interfaces:**
- Produces: `requireStaff(roles?: StaffRole[]): Promise<StaffSession>`, `can(role, permission): boolean`, login/logout actions, session refresh proxy, and protected admin shell.
- Consumes: `profiles` and role helper from Task 2; environment parser from Task 1.

- [ ] Write permission-matrix tests and unauthorized/role-denied route tests; verify RED.
- [ ] Implement browser/server Supabase factories using `@supabase/ssr` cookie APIs.
- [ ] Implement server-side `getClaims`/profile lookup and permission checks; never trust client metadata.
- [ ] Implement login with Zod validation, generic invalid-credential errors, next-path allowlisting, logout, protected layout, and optimistic proxy redirect.
- [ ] Document safe first-admin creation through the Supabase dashboard plus explicit UUID assignment; no public bootstrap endpoint.
- [ ] Run auth unit tests, route tests where credentials are available, typecheck, and build; commit `feat: protect the admin application`.

### Task 4: Product domain and administration workflow

**Files:**
- Create: `src/lib/validation/product.ts`, `src/lib/affiliate/url.ts`, `src/services/products/repository.ts`, `queries.ts`, `mutations.ts`, `src/app/admin/(protected)/products/**`, `src/components/products/product-editor/**`, `src/components/admin/data-table.tsx`
- Test: `src/lib/affiliate/__tests__/url.test.ts`, `src/lib/validation/__tests__/product.test.ts`, `tests/products/admin-products.spec.ts`

**Interfaces:**
- Produces: `validateAmazonUrl(input): AffiliateUrlResult`, `productDraftSchema`, `productPublishSchema`, paginated product queries, create/update/duplicate/status/archive/delete mutations, image ordering, and the complete sectioned editor.
- Consumes: auth/permissions from Task 3, tables and DTO types from Task 2, media upload boundary from Task 6 when available (temporary image URL fields remain disabled until then).

- [ ] Write URL tests for deceptive hosts, credentials, ports, protocol, exact URL preservation, and ASIN mismatch; verify RED.
- [ ] Implement affiliate parsing/validation and publish-vs-draft product schemas; run GREEN.
- [ ] Write repository/mutation tests for filters, pagination, safe status transitions, duplicate semantics, and category deletion protection; verify RED then implement.
- [ ] Build responsive product table with truthful empty/error/loading states and working view/edit/duplicate/publish/unpublish/archive/delete actions.
- [ ] Build the eight-section product editor with section error summary, on-blur validation, dynamic lists/specifications, exact affiliate-link preview, draft/publish buttons, preview route, and unsaved-changes warning.
- [ ] Verify unit tests and Playwright workflow against a configured test project when available; commit `feat: add product publishing workflow`.

### Task 5: Structured buying-guide workflow

**Files:**
- Create: `src/lib/validation/article.ts`, `src/services/articles/*`, `src/app/admin/(protected)/articles/**`, `src/components/articles/block-editor/**`, `src/components/articles/article-renderer.tsx`
- Test: `src/lib/validation/__tests__/article.test.ts`, `tests/articles/admin-articles.spec.ts`

**Interfaces:**
- Produces: safe `ArticleBlock` union, block validation, create/update/duplicate/status/archive/delete mutations, product recommendation selection, preview, and public renderer.
- Consumes: product chooser/query from Task 4 and auth/permissions from Task 3.

- [ ] Write block-schema tests for headings, paragraphs, lists, images, product recommendations, unknown block rejection, and publish requirements; verify RED.
- [ ] Implement schemas and a renderer that never uses arbitrary HTML; run GREEN.
- [ ] Write workflow tests for draft, preview, publish, reorder, product insertion, and invalid referenced product; verify RED then implement services/actions.
- [ ] Build a keyboard-accessible block editor with insert, edit, reorder, remove, save state, error summary, and unsaved-changes warning.
- [ ] Run tests, typecheck, and build; commit `feat: add buying guide workflow`.

### Task 6: Categories, media, affiliate links, settings, navigation, users, and logs

**Files:**
- Create: `src/services/{categories,media,affiliate-links,settings,navigation,users,activity}/*`, corresponding `src/app/admin/(protected)/**` routes, `src/lib/validation/media.ts`, `src/components/media/uploader.tsx`
- Test: `src/lib/validation/__tests__/media.test.ts`, `tests/admin/supporting-modules.spec.ts`

**Interfaces:**
- Produces: complete supporting CRUD, Storage upload/delete, media reference checks, affiliate-link testing metadata, settings resolution, ordered navigation, administrator-only user roles, and activity views.
- Consumes: permission matrix from Task 3 and product/article references from Tasks 4–5.

- [ ] Write media MIME/size/path/reference and role-boundary tests; verify RED.
- [ ] Implement media upload/delete/reorder and wire product/article image pickers; run GREEN.
- [ ] Write CRUD and authorization tests for every supporting module; verify RED then implement repositories/actions/pages.
- [ ] Ensure every rendered action has a mutation, confirmation where destructive, pending state, success/error feedback, and empty state.
- [ ] Run suite, typecheck, and build; commit `feat: complete administration modules`.

### Task 7: Public publication and dynamic metadata

**Files:**
- Create: `src/app/(public)/**`, `src/components/public/**`, `src/services/public/*`, `src/lib/seo/*`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts`
- Test: `src/services/public/__tests__/visibility.test.ts`, `src/lib/seo/__tests__/metadata.test.ts`, `tests/public/publication.spec.ts`

**Interfaces:**
- Produces: homepage, category/product/guide indexes and detail routes, search/sort/pagination, legal/support pages, dynamic metadata, JSON-LD without ratings, Pinterest share URLs, and settings-driven navigation/content.
- Consumes: published DTOs from Tasks 4–6 and article renderer from Task 5.

- [ ] Write visibility and price-freshness tests; verify drafts, stale prices, and inactive links fail closed.
- [ ] Implement public repositories and metadata builders; run GREEN.
- [ ] Build the editorial public routes with real database content, skeleton/loading boundaries, empty/error/not-found behavior, responsive navigation, breadcrumbs, internal links, and disclosure placement.
- [ ] Implement search/sort/pagination through validated URL search parameters and accessible controls.
- [ ] Implement sitemap, robots, Organization/Article/BreadcrumbList structured data, OG/Twitter/Pinterest metadata, and canonical URLs.
- [ ] Run unit, browser, responsive, accessibility, type, lint, and build checks; commit `feat: connect the public publication`.

### Task 8: Safe outbound redirect and analytics

**Files:**
- Create: `src/app/go/[slug]/route.ts`, `src/services/analytics/*`, `src/app/admin/(protected)/analytics/page.tsx`, `src/components/admin/analytics/**`, `src/lib/analytics/attribution.ts`
- Test: `src/lib/analytics/__tests__/attribution.test.ts`, `tests/affiliate/redirect.spec.ts`

**Interfaces:**
- Produces: safe redirect lookup, click insertion, UTM/referrer normalization, optional session hashing, date-filtered aggregates, CSV export, and truthful analytics views.
- Consumes: validated active affiliate link from Task 4 and product/category/article data from earlier tasks.

- [ ] Write redirect tests for draft products, missing/inactive links, deceptive stored destinations, insertion failure, and exact URL preservation; verify RED.
- [ ] Implement redirect route and attribution normalization so destinations never come from query parameters; run GREEN.
- [ ] Write aggregate/date-window/Pinterest-source tests; verify RED then implement analytics queries and export.
- [ ] Build real charts/tables with zero-data states and explicit separation between clicks and unavailable purchase/commission data.
- [ ] Run tests, typecheck, lint, and build; commit `feat: add affiliate click analytics`.

### Task 9: Compliance, deployment, and full-system QA

**Files:**
- Modify: all affected routes/components
- Create: `README.md`, `docs/deployment.md`, `docs/amazon-compliance.md`, `docs/verification.md`, `tests/security/*`, `tests/e2e/full-workflow.spec.ts`

**Interfaces:**
- Produces: owner setup path, Vercel/Supabase deployment instructions, compliance checklist, security regression suite, and final verification record.
- Consumes: every preceding task.

- [ ] Write security tests for role escalation, secret exposure, arbitrary redirect attempts, unpublished reads, and Storage writes; verify they would catch regressions.
- [ ] Run available Supabase database tests against a local or dedicated test project; document any unverified integration explicitly.
- [ ] Run the complete owner workflow: login, create draft product, upload image, attach active affiliate URL, preview, publish, observe public visibility, click redirect, and observe analytics.
- [ ] Run unit tests, lint, typecheck, production build, Playwright at 375/768/1024/1440 px, keyboard checks, reduced-motion checks, and design inspectors.
- [ ] Create a clean source archive without `node_modules`, `.next`, local credentials, or test artifacts; commit `docs: prepare Home Essentials deployment`.
