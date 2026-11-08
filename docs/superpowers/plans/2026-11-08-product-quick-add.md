# Product Quick Add Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the new-product page’s eight-section editor with a six-input Quick Add form that generates the remaining publishable product fields on the server.

**Architecture:** A focused Quick Add mapper converts the six visible form values into the existing `ProductDraftInput` contract, including a derived slug, ASIN, descriptions, image alt text, and SEO description. A new server action reuses the existing authenticated product-persistence path, and the existing detailed editor remains unchanged for subsequent edits.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, Supabase SSR/RLS, Vitest, Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-11-08-product-quick-add-design.md`

## Global Constraints

- No database migration or public-route change.
- Keep exact Amazon.com link validation, ASIN extraction, tracking-ID requirement, administrator-only affiliate-link management, and confirmation before publication.
- Keep manual prices, ratings, reviews, scraped Amazon content, checkout, and inventory out of scope.
- Preserve the existing detailed editor for all optional fields after creation.
- Keep semantic labels, visible focus, field-level errors, first-error focus, 44 px mobile targets, and reduced-motion behavior.
- Use Lucide icons only; no emoji and no new dependency.

## Review Focus

- A deceptive or malformed Amazon URL must remain attached to `affiliateUrl` and must not produce a trusted ASIN.
- A valid Amazon product URL without a `tag` may be saved in a draft but must fail publication with a visible affiliate-link error.
- A recommendation longer than the card/SEO limits must be safely truncated for generated summaries without changing the full recommendation.
- A non-admin must not gain a new path to create or verify affiliate links.
- Repeated product names must still surface the existing duplicate-slug error without losing entered form values.

---

### Task 1: Quick Add normalization and validation

**Files:**
- Create: `src/services/products/quick-add.ts`
- Create: `src/services/products/__tests__/quick-add.test.ts`

**Interfaces:**
- Consumes: `slugifyProductName(value: string): string`, `validateAmazonUrl(input, options)`, `ProductDraftInput`, and the existing `productDraftSchema` / `productPublishSchema`.
- Produces: `quickProductFormDataToInput(formData: FormData): ProductDraftInput` for the server action.

- [ ] **Step 1: Write failing normalization tests**

Add tests named `maps six quick fields into a publishable product`, `keeps a name-only draft valid`, `does not trust a malformed Amazon URL`, `requires a tracking ID for publication`, and `truncates generated summaries without truncating the recommendation`. Assert the exact ASIN `B0DWG1P145`, slug `vaunn-adjustable-overbed-table`, unchanged affiliate URL, generated image alt equal to the product name, maximum 500-character short/SEO descriptions, and standard-schema success or failure.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm run test -- src/services/products/__tests__/quick-add.test.ts`

Expected: FAIL because `quickProductFormDataToInput` does not exist.

- [ ] **Step 3: Implement `quickProductFormDataToInput(formData: FormData): ProductDraftInput`**

Read `name`, `categoryId`, `recommendation`, `mainImageUrl`, `affiliateUrl`, and `affiliateConfirmed`. Derive the slug with `slugifyProductName`; derive ASIN only from a successful `validateAmazonUrl`; reuse the full recommendation for `description` and `recommendation`; use its first 500 characters for `shortDescription` and `seoDescription`; use the product name for `mainImageAlt`; set price source to `none`; and initialize every advanced list/text field to the existing empty representation.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `npm run test -- src/services/products/__tests__/quick-add.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit normalization**

```powershell
git add src/services/products/quick-add.ts src/services/products/__tests__/quick-add.test.ts
git commit -m "feat: normalize quick product entries"
```

### Task 2: Authenticated Quick Add server action

**Files:**
- Modify: `src/services/products/mutations.ts`
- Create: `tests/products/quick-add-action.spec.ts`

**Interfaces:**
- Consumes: `quickProductFormDataToInput(formData)`, existing product schemas, `requireStaff()`, `can(role, "affiliateLinks.manage")`, and the current Supabase insert/link/status operations.
- Produces: `createQuickProductAction(previousState: ProductActionState, formData: FormData): Promise<ProductActionState>` for the form.

- [ ] **Step 1: Write the failing action-contract test**

Assert that the mutations module exports `createQuickProductAction`, normalizes through `quickProductFormDataToInput`, requires a staff session before database access, applies the standard draft/publish schema for the submitted intent, and retains the administrator permission check before saving an affiliate link.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test -- tests/products/quick-add-action.spec.ts`

Expected: FAIL because the Quick Add action is absent.

- [ ] **Step 3: Refactor the existing create path into one private persistence function**

Extract the post-validation insert, affiliate-link save, status transition, revalidation, and redirect from `createProductAction` into a private function that accepts the authenticated session, validated `ProductDraftInput`, and intent. Keep the existing detailed-editor action behavior unchanged.

- [ ] **Step 4: Implement `createQuickProductAction`**

Normalize the Quick Add form, choose `productDraftSchema` or `productPublishSchema` from the intent, map generated-field validation errors back to the visible `recommendation`, `mainImageUrl`, or `affiliateUrl` fields, enforce administrator link permission, then call the shared persistence function.

- [ ] **Step 5: Run action and existing product tests**

Run: `npm run test -- tests/products/quick-add-action.spec.ts src/lib/validation/__tests__/product.test.ts src/services/products/__tests__/quick-add.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the action**

```powershell
git add src/services/products/mutations.ts tests/products/quick-add-action.spec.ts
git commit -m "feat: add quick product creation action"
```

### Task 3: Distilled Quick Add interface

**Files:**
- Create: `src/components/products/quick-product-editor.tsx`
- Modify: `src/app/admin/(protected)/products/new/page.tsx`
- Modify: `src/app/globals.css`
- Create: `tests/products/quick-add-ui.test.tsx`

**Interfaces:**
- Consumes: `createQuickProductAction`, `initialProductActionState`, category `{ id, name, slug }` records, and the signed-in `StaffRole`.
- Produces: `QuickProductEditor({ categories, role })` as the only editor rendered by the new-product route.

- [ ] **Step 1: Write the failing interface test**

Using Testing Library with a mocked server action, assert that an administrator sees labels for Product name, Category, Short recommendation, Product image URL, Amazon.com affiliate URL, and link confirmation; sees Publish product and Save draft; and does not see Model, Specifications, Pricing, or advanced SEO controls. Add an editor-role case asserting that affiliate controls are unavailable, an explanation is visible, Save draft remains available, and Publish product is disabled.

- [ ] **Step 2: Run the focused UI test and verify RED**

Run: `npm run test -- tests/products/quick-add-ui.test.tsx`

Expected: FAIL because `QuickProductEditor` does not exist and the route still renders `ProductEditor`.

- [ ] **Step 3: Read the Impeccable craft floor immediately before editing UI**

Read: `C:\Users\vicen\.codex\skills\impeccable\reference\craft-floor.md`

Apply its Operate-mode and accessibility constraints to the existing framed-sheet design without changing the visual identity.

- [ ] **Step 4: Implement `QuickProductEditor`**

Build one linear form with the six approved inputs, inline Amazon-link recognition, an accessible error summary that receives focus, field-level messages, a small no-manual-price note, one near-black Publish product primary action, and Save draft as the secondary action. Preserve unsaved-change protection and disable actions while pending. For an editor, replace affiliate inputs with the existing administrator-only explanation, keep Save draft available, and disable Publish product until an administrator supplies and verifies a link in the detailed editor.

- [ ] **Step 5: Replace the new route’s editor and copy**

Render `QuickProductEditor` from `src/app/admin/(protected)/products/new/page.tsx`. Change the introduction to explain that only the essentials are needed now and details can be refined after saving.

- [ ] **Step 6: Add scoped responsive styles**

Add `quick-product-*` styles to `src/app/globals.css` using the existing cream, white, charcoal, gold, border, radius, focus, and mobile-breakpoint tokens. Keep the form one column and avoid nested cards.

- [ ] **Step 7: Run the focused UI and normalization tests**

Run: `npm run test -- tests/products/quick-add-ui.test.tsx src/services/products/__tests__/quick-add.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the interface**

```powershell
git add src/components/products/quick-product-editor.tsx src/app/admin/(protected)/products/new/page.tsx src/app/globals.css tests/products/quick-add-ui.test.tsx
git commit -m "feat: simplify new product entry"
```

### Task 4: Documentation, full verification, and deployment

**Files:**
- Modify: `README.md`
- Modify: `docs/verification.md`

**Interfaces:**
- Consumes: completed Quick Add workflow.
- Produces: current owner instructions and verified release evidence.

- [ ] **Step 1: Update the product workflow documentation**

Document the six Quick Add inputs, generated fields, Save draft behavior, and the detailed editor’s optional role. Do not claim automatic Amazon catalog fetching.

- [ ] **Step 2: Run complete automated verification**

Run separately: `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

Expected: all commands exit 0; record exact test counts.

- [ ] **Step 3: Inspect the local interface**

Verify `/admin/products/new` at desktop and mobile widths with the authenticated local account. Confirm hierarchy, labels, link feedback, disabled/pending behavior, keyboard focus, and that advanced fields are absent.

- [ ] **Step 4: Verify real database behavior**

Save a clearly named temporary draft through the authenticated local form, confirm it appears in `/admin/products`, then delete only that known temporary record through the normal admin workflow. Do not create a fake published product.

- [ ] **Step 5: Update the verification record and commit**

```powershell
git add README.md docs/verification.md
git commit -m "docs: document quick product entry"
```

- [ ] **Step 6: Push and verify Vercel**

Push the current branch to `origin/main`, wait for the deployment, then verify the live public routes remain healthy. Live admin UI verification requires the owner’s authenticated browser session and must not expose or request the password.
