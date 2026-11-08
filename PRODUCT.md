# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Supabase PostgreSQL/Auth/Storage, Vercel.

## Users

US shoppers arriving primarily from Pinterest use the public publication to discover practical household products and buying guidance. The owner and invited editors use a private CMS to research, prepare, review, and publish that content.

## Product Purpose

Home Essentials is an independent home-product discovery and recommendation publication. It turns useful room ideas into well-explained product shortlists and sends interested readers to verified Amazon.com destinations. Success means an administrator can publish or update a product or guide and see that database change on the public site without a code change or redeployment.

## Positioning

Practical home finds are presented as editorial guidance, with measurements, tradeoffs, source-aware claims, and clear affiliate disclosure rather than thin product tiles or a simulated shop.

## Operating Context

Editors work with product names, ASINs, verified Amazon affiliate URLs, owned or licensed images, categories, structured recommendations, SEO metadata, article blocks, and publication states. Visitors browse categories and guides, then use a controlled outbound redirect to Amazon US.

## Capabilities and Constraints

- Private `admin` and `editor` roles; no public administrator registration.
- Supabase RLS is the authoritative data-access boundary.
- Product, category, guide, media, affiliate-link, settings, navigation, analytics, user, and activity-log administration.
- No checkout, cart, inventory, order, payment, or fulfillment functionality.
- No Amazon scraping, invented prices, reviews, ratings, sales, or commission figures.
- Prices are hidden unless supplied through a compliant current data source.
- Amazon links remain exact and are validated before use; visitors never provide redirect destinations.

## Brand Commitments

The brand is Home Essentials. It is minimalist, modern, premium editorial, warm, and professional. The confirmed palette is charcoal black, warm cream, white, warm gold, muted gray, and soft gray. Playfair Display is the heading voice; Inter is the body and control voice. Use Lucide icons and never emoji as interface icons.

## Evidence on Hand

The project contains a static Home Essentials publication and four generated room images used only as interior inspiration. Five real product names and observed ASINs exist in the static reference, but the production database must not be seeded with products. No Amazon API credentials, approved product-image feed, prices, ratings, testimonials, purchase data, commission data, contact address, or Pinterest account URL have been supplied.

## Product Principles

- Helpful content before affiliate action.
- Compliance and source integrity by construction.
- Draft safely, publish deliberately, update without redeployment.
- Show real zero and empty states rather than invented momentum.
- Keep administrative work fast, legible, and recoverable.

## Accessibility & Inclusion

Semantic HTML, keyboard access, visible focus, 44 px touch targets, WCAG AA text contrast, meaningful image alternatives, and reduced-motion support are required across public and administrative interfaces.
