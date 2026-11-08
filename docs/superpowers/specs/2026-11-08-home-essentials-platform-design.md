# Home Essentials publishing platform

## Intent

Home Essentials is an affiliate publisher for US shoppers, not a merchant. It should help a Pinterest visitor move from a useful household idea to a carefully explained product recommendation, then send that visitor to a verified Amazon.com destination. The owner needs a private CMS that makes products and buying guides easy to create, review, publish, and maintain without editing code or redeploying.

The existing static publication remains a reference and fallback. This project is a separate production application built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide, Supabase PostgreSQL, Auth, Storage, and Row Level Security. Vercel will host the application. Supabase will own persistent content and permissions.

## Goals

- Make product editing the strongest administrative workflow: structured sections, clear validation, image management, exact affiliate-link preservation, preview, status changes, and an unsaved-changes warning.
- Make buying guides structured and reusable, with safe editorial blocks and product recommendation blocks rather than raw unsanitized HTML.
- Make compliance a system property: required disclosure placement, Amazon-host validation, no open redirects, no invented prices/ratings/reviews, and no public purchase action without an active verified link.
- Enforce authorization twice: server-side role checks in the application and RLS/grants in PostgreSQL.
- Publish immediately from the database. A published record appears on public routes without a source change or deployment.
- Capture outbound clicks without claiming purchases, sales, or commissions.
- Support SEO, Pinterest previews, responsive layouts, accessibility, loading/empty/error/success states, and reduced motion.

## Non-goals and anti-goals

- No cart, checkout, inventory, order, fulfillment, payment, or customer-account system.
- No public administrator registration and no role supplied by the client.
- No Amazon scraping. Product data and images are entered by an authorized editor or, later, fetched through an approved Amazon API adapter.
- No fake reviews, ratings, testimonials, prices, analytics, or commission data.
- No service-role credential in browser code. Ordinary content mutations use the signed-in user's session and RLS.
- No generic dashboard ornament: no decorative KPI icons, rainbow charts, glass effects, gradients, or fabricated trends.

## Chosen architecture

### Application boundary

Use Next.js 16 App Router with Server Components by default. Server Actions handle authenticated mutations. Route Handlers are reserved for machine-oriented behavior such as the outbound redirect. `proxy.ts` refreshes Supabase sessions and performs only an optimistic admin-route redirect; every protected layout and mutation performs a secure database-backed role check.

The application is divided into:

- `src/app/(public)`: indexable publication routes.
- `src/app/admin`: protected CMS routes.
- `src/app/go/[slug]`: validated outbound redirect.
- `src/components`: public, admin, editor, and shared UI.
- `src/lib`: Supabase clients, authorization, validation, SEO, affiliate safety, and utilities.
- `src/services`: database access and DTO mapping. Components do not contain raw queries.
- `supabase/migrations`: schema, grants/RLS, storage, functions/triggers, and indexes.

### Database and authorization

Create the required tables plus `media_assets`, which is necessary for a real centralized media library. Use relational joins for tags and article recommendations; JSONB is limited to flexible specifications, feature lists, and structured article blocks.

The `profiles.role` value is controlled only by privileged database/admin operations. A private `has_role(required_roles text[])` security-definer function reads the authenticated user's profile with an empty `search_path`. Policies call this helper. Anonymous grants are explicitly limited to public reads and click insertion through a controlled function; authenticated grants are similarly narrow.

Public reads require all relevant publication flags: active categories, published products/articles, public settings, and images belonging to published content. Editors can manage editorial content but cannot manage profiles, administrator-only settings, or security. Administrators can manage all application data. Activity-log rows are append-only to normal authenticated users.

The first administrator is created through the Supabase dashboard or server-side Admin API, followed by an explicit SQL role assignment using that user's UUID. There is no first-user-wins bootstrap route.

### Product and guide content

The product editor is one form with a sticky section index: Basics, Images, Specifications, Amazon, Recommendation, Pricing, SEO, and Publishing. Draft saves require only a name; publishing requires a slug, active category, description, main image with alt text, recommendation, SEO description, and an active valid Amazon US affiliate link. Validation errors link back to their section. The editor warns before leaving with local unsaved changes.

Affiliate URLs are stored exactly as supplied. Validation parses the URL, requires HTTPS, rejects credentials and nonstandard ports, and allows only `amazon.com`, `www.amazon.com`, or subdomains ending in `.amazon.com`. Redirects query by product slug and active link ID; visitors never submit the destination.

Article content is an ordered JSON block array with a small safe vocabulary: paragraph, heading, list, image, product recommendation, and related article. This avoids unsafe arbitrary HTML and makes public rendering, previews, and future migrations predictable. A focused block editor can be extended without changing published content.

Prices are hidden by default. Public price output requires `price_source = 'amazon_api'`, a numeric amount/currency, and a verification timestamp within 24 hours. Manual notes may exist in admin but never create a public price. Ratings and review structured data are not supported.

### Analytics and privacy

`/go/[slug]` verifies publication and link state, records the product, optional article, landing page, referrer, and UTM fields, then redirects to the exact stored URL. The event contains no claimed purchase or revenue. A random first-party session token may be hashed server-side for approximate unique-session counts when `CLICK_HASH_SECRET` is configured; raw IP addresses and raw session tokens are not stored. If event insertion fails, the safe redirect still succeeds and the server records an operational error.

### Media

Supabase Storage uses a public-read `public-media` bucket and authenticated write policies. Upload actions validate MIME type, extension, and a 5 MB default limit, generate collision-resistant paths, and persist alt text/metadata in `media_assets`. Deletion checks product/article references and requires explicit confirmation when an unpublished reference exists; published references block deletion until reassigned.

## Experience design

### Public publication

Mode: Persuade for landing/category/product pages and Read for buying guides. Preserve the warm editorial identity while adopting the supplied brand tokens: warm cream `#F8F6F1`, charcoal `#252525`, white, warm gold `#C69A5B`, muted gray `#777777`, and soft gray borders. Playfair Display leads headlines; Inter handles reading and controls. Public pages use large interior photography, disciplined editorial grids, square or slightly eased controls, and restrained motion. The hero headline is the supplied “Make Your Home Feel More Like Home.” and remains two lines or fewer at supported widths.

### Admin CMS

Mode: Operate. The shell uses the same materials but is denser and quieter: a light sidebar, 24 px noun titles, tabular figures, hairline divisions, no decorative metric icons, and one near-black primary action per screen. Product forms keep labels visible, validate on blur and submit, preserve typed data after an error, and expose save state. Tables become two-line list rows on phones; actions remain reachable with 44 px targets.

Charts render only real query results. Empty analytics show a zero axis and plain explanation rather than sample data. Loading skeletons match final dimensions; errors name the failed action and a recovery path.

## Operational states

- Missing Supabase configuration: public pages show a setup-safe empty state; admin login explains configuration is required. Builds do not leak secret values.
- Unauthenticated: admin routes redirect to `/admin/login?next=...`.
- Authenticated without role: return an access-denied screen and sign-out action.
- Empty database: categories may be seeded; products, guides, analytics, and media show truthful empty states.
- Invalid or missing affiliate link: public product remains readable but the purchase action is absent.
- Storage/database failure: keep form input, show a field or form-level message, and avoid false success toasts.

## Approaches considered

1. Keep expanding the static generator. It is reliable for previews but cannot satisfy database-driven publishing, authentication, storage, analytics, or immediate updates.
2. Use a headless third-party CMS plus Supabase analytics. This shortens article editing but splits authorization and product/link compliance across systems.
3. Build one Next.js and Supabase application. This keeps editorial data, roles, media, outbound links, and public rendering under one RLS-backed model. This is the chosen approach because the requested workflows share the same product and publication state.

## Delivery sequence

1. Establish the Next.js application, design tokens, Supabase clients, schema, grants/RLS, storage, seed, and generated-compatible database types.
2. Build authentication, protected layouts, and authorization helpers.
3. Build the product and guide workflows, then supporting category/media/link/settings administration.
4. Connect the public publication to the same services.
5. Add outbound redirect analytics, SEO/Pinterest metadata, QA, and deployment documentation.

The project can be built and statically checked without credentials, but real authentication, RLS, Storage, and publish-to-public behavior require the owner to create a Supabase project, apply migrations, and supply environment values.
