# Public Catalog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Recompose the public Home Essentials site into a clean professional catalogue with substantially smaller product cards while preserving all working data and affiliate behavior.

**Architecture:** Add a public-only font and token scope at `PublicShell`, then update shared public components and route copy to follow one catalogue system. Keep repository queries and product-detail commerce logic unchanged. A small client-only hero gallery owns the optional crossfade and visibility pause; all catalog content remains server-rendered.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, next/font, Lucide, Supabase, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-11-08-public-catalog-redesign-design.md`

## Constraints

- Do not modify Supabase schemas, authentication, admin forms, affiliate validation, or product records.
- Do not add prices, ratings, reviews, inventory, checkout, or fabricated proof.
- Use existing room and published product images only.
- Keep public routes semantic, keyboard accessible, responsive, and usable without animation.
- Use no new package dependency.

---

### Task 1: Lock the public presentation contract

**Files:**
- Create: `tests/public/catalog-ui.test.tsx`
- Modify: `tests/shell.test.tsx`

- [ ] **Step 1: Write failing rendering tests**

Render a representative `ProductCard` and assert the category, product name, compliant fallback CTA, detail affordance, accessible image name, and card link. Update the shell contract to expect the concise home title and existing Amazon disclosure.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm run test -- tests/public/catalog-ui.test.tsx tests/shell.test.tsx`

Expected: FAIL because the new detail affordance and home title are not implemented.

- [ ] **Step 3: Commit the test contract with the implementation task**

Do not commit a deliberately red tree; carry the tests into Task 2 and commit after they pass.

---

### Task 2: Implement the restrained catalogue system

**Files:**
- Create: `src/components/public/hero-room-gallery.tsx`
- Modify: `src/components/public/public-shell.tsx`
- Modify: `src/components/public/product-card.tsx`
- Modify: `src/components/public/public-footer.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/products/page.tsx`
- Modify: `src/app/categories/page.tsx`
- Modify: `src/app/categories/[slug]/page.tsx`
- Modify: `src/app/guides/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Scope Hanken Grotesk and the palette to `PublicShell`**

Use `next/font/google` with weights 400 and 500 and a CSS variable on the public wrapper. Add public-only color, type, spacing, focus, interaction, and reduced-motion tokens without changing admin variables.

- [ ] **Step 2: Recompose the home page**

Use the two-line hero, concise supporting copy, room-photo crossfade, full-width section fields with constrained inner content, and direct headings without eyebrow labels.

- [ ] **Step 3: Compact and clarify shared cards**

Change product media to a square `contain` specimen field, reduce card typography and copy length, add the Lucide detail affordance, and use four/three/two/one-column responsive grids. Bring category and article cards into the same system.

- [ ] **Step 4: Align listing routes**

Shorten public page titles, remove public eyebrow labels, and restyle filters, result headings, empty states, and listing spacing without changing submitted query parameters or data fetching.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm run test -- tests/public/catalog-ui.test.tsx tests/shell.test.tsx`

Expected: PASS.

---

### Task 3: Browser critique, hardening, and release verification

**Files:**
- Modify as required by browser findings: public files from Task 2
- Create: `.taste-skill/critique.md` (local design evidence)

- [ ] **Step 1: Run static checks**

Run the taste linter against public TSX and public-facing CSS, then run ESLint and TypeScript. Fix all relevant failures.

- [ ] **Step 2: Inspect real responsive renders**

Run the taste browser inspector at 1440, 768, and 390 px. Open every fold and full-page screenshot. Confirm the hero is two lines or fewer, there is no sideways overflow, product cards are visibly shorter, and content is present before motion runs.

- [ ] **Step 3: Write the critique and fix the top three issues**

Use the required round format in `.taste-skill/critique.md`, including the idea sentence, live thing, layout words, scores, caps, and screenshot-specific fixes. Re-inspect after the fixes, up to three rounds.

- [ ] **Step 4: Run full verification**

Run: `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

Expected: all commands exit 0.

- [ ] **Step 5: Review the diff and publish**

Confirm the diff contains no data, schema, authentication, or affiliate-link changes. Commit the implementation, push the current branch to `origin/main`, and verify the Vercel deployment and public routes if deployment access remains available.

