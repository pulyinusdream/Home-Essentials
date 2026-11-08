# Product Quick Add design

## Intent

Reduce the time required to add a routine Amazon recommendation. The new-product route should ask only for information the owner must deliberately supply, while the existing detailed editor remains available after creation.

## Chosen approach

Add a dedicated Quick Add form at `/admin/products/new`. It uses the existing product tables, permissions, validation rules, and publication workflow; there is no second product model and no database migration.

Alternatives considered:

1. Collapse the existing eight-section editor into required and optional accordions. This still exposes too much structure during the first entry.
2. Allow link-only publishing. This is faster but produces thin pages and weakens the editorial purpose of Home Essentials.
3. Use a dedicated Quick Add form, then redirect to the detailed editor. This is selected because it removes first-entry complexity while preserving optional depth.

## Quick Add experience

The page shows one linear form with:

- Product name
- Category
- Short recommendation
- Authorized product image URL
- Amazon.com affiliate URL
- “I generated and checked this link” confirmation

There are two actions:

- **Publish product** is the single primary action.
- **Save draft** is secondary and requires only a product name.

Publishing derives these values on the server:

- Slug from the product name
- ASIN and tracking ID from the validated Amazon URL
- Short description, full description, and recommendation from the supplied recommendation
- Image alt text from the product name
- SEO description from a safely truncated recommendation

The form explains that price is intentionally omitted and provides a direct link to the full editor after a draft is created. Validation errors remain beside the relevant visible field and the first error receives focus.

## Preserved safeguards

- Only an administrator can create or verify an affiliate link.
- The URL must be a direct HTTPS Amazon.com product URL with an ASIN and tracking ID.
- The confirmation checkbox remains required for publication.
- Category and image are required for publication but optional for a draft.
- Manual live prices, ratings, reviews, and scraped Amazon content remain unsupported.
- Existing database publication triggers, RLS, and public visibility rules remain unchanged.

## Scope

The existing detailed product editor remains unchanged for editing brand, model, features, specifications, benefits, pros, cons, use guidance, and advanced SEO after creation. Public product pages and buying guides are unchanged.

## Verification

- Add failing unit tests for Quick Add normalization and validation before implementation.
- Verify a name-only draft and a six-input publishable product.
- Verify ASIN extraction, tracking-ID enforcement, generated descriptions/SEO, and permission handling.
- Run the complete test suite, lint, type-check, and production build.
- Inspect the new form at desktop and mobile widths and confirm keyboard focus and error behavior.
