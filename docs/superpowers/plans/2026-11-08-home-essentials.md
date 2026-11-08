# Home Essentials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the supplied Home Essentials website brief with truthful Amazon product research and accessible category browsing.

**Architecture:** Vinext app-router pages render shared layout and typed editorial content. Only navigation, filters, image fallbacks, and sharing require client components. Configuration controls affiliate activation and owner contact details.

**Tech Stack:** React, TypeScript, Vinext, plain CSS tokens, Lucide SVG icons, Node test runner.

**Spec:** docs/superpowers/specs/2026-11-08-home-essentials-design.md

## Global Constraints

- Brand: Home Essentials. Amazon.com, US shoppers, USD, US English.
- No fabricated products, links, prices, reviews, ratings, personal testing, or contact details.
- Preserve user npm script policy when repairing starter compatibility.
- No visitor database or fake contact submission.

## Review Focus

- Invalid affiliate configuration must never generate an unsafe destination or tag.
- Search must handle punctuation, case, empty input, and no results.
- Missing products and category slugs must return a real 404.
- Narrow screens must retain navigation and readable content without overflow.
- No configured email must present an honest contact state.

### Task 1: Verified catalog and affiliate boundary

Files: lib/affiliate.ts, lib/content.ts, lib/site.ts, tests/affiliate.test.ts.
- [ ] Write and run failing Node tests for URL host/ASIN validation and affiliate activation.
- [ ] Implement validated URL creation and typed catalog from observed primary sources.
- [ ] Run tests to green; record sources and the verification date in product data.

### Task 2: Shared visual system and routes

Files: app/layout.tsx, app/globals.css, components/site-shell.tsx, components/catalog.tsx, components/content.tsx, all app route pages, public/assets.
- [ ] Implement coherent tokens, source local room photography and fonts, and shared navigation/footer.
- [ ] Implement homepage, category/search browsing, product articles, buying guides, and supporting pages.
- [ ] Implement loading, empty, error, missing-image, disabled contact, and share feedback states.
- [ ] Run TypeScript, lint, Node tests and build; repair actual failures.

### Task 3: Browser review and delivery

Files: verification evidence in work/ outside deliverable; README.md; outputs ZIP and screenshot.
- [ ] Verify route statuses, page metadata and truthful structured data.
- [ ] Review desktop/tablet/mobile and exercise interactive controls.
- [ ] Record limitations and configuration instructions.
- [ ] Commit/push/package through the Sites helper, deploy privately and confirm returned deployment status.
