# Public Catalog Redesign

## Intent

Make the Home Essentials marketing site clean, professional, and quicker to browse, with particular attention to reducing the visual height of product cards. Preserve the working publishing, Supabase, authentication, affiliate-link, and product-detail behavior.

## Subject and argument

- Audience: US shoppers arriving from Pinterest or search who want practical home recommendations.
- What this is: an editorial catalog of reviewed home essentials and useful buying guides.
- First-screen belief: Home Essentials helps shoppers find practical products without turning the site into a store.
- Proof: real published products, room photography, product imagery, categories, and verified Amazon destinations.
- Next action: browse products or start with a room.

Page argument: browse by room, compare clearly labelled reviewed products, read useful context, then follow the verified Amazon link when ready.

## Direction

Use the taste-skill direction “The specimen catalogue” with seed `431270297`. Each reviewed home essential becomes a labelled specimen in a calm household catalogue.

The original dealt type and palette were redrawn because the playful Pilcrow Rounded face and loud poster colors conflicted with the owner’s explicit “clean and professional” requirement. Retain the catalogue composition and use:

- Hanken Grotesk at weights 400 and 500.
- Bone `#e5e1d8` for the ground, warm surface `#dad5ca`, dark brown `#2a1d17`, muted brown `#6b5b51`, and restrained green `#456f3a`.
- Existing room photography and owner-published product imagery. Do not introduce stock imagery or fabricated product content.
- Slow room-photo crossfade as the single signature motion, with static content under reduced motion.

## Scope

### Public shell

- Scope the new type and palette to the public site so the admin experience does not change.
- Use equal 16–32 px page margins, a quiet navigation row, visible focus states, and a full green footer field.
- Keep the required Amazon Associate disclosure visible in the shared footer.

### Home page

- Replace the four-line hero statement with a concise, authored two-line title: “Better finds for / everyday homes”.
- Keep one primary action (“Browse products”) and one secondary text link (“Shop by room”).
- Crossfade the four existing room images slowly in one fixed hero frame. Pause the loop when the tab is hidden; show only the first frame for reduced motion.
- Recompose sections as split hero, room index, product catalogue, and guide row. Use section ground changes and spacing rather than decorative rules or shadows.
- Remove public eyebrow labels and tiny all-caps metadata.

### Cards and listings

- Product grids use four columns on wide screens, three on medium screens, two on small tablets, and one on narrow phones.
- Product media uses a compact square neutral field with `contain` sizing so owner-supplied product cutouts remain fully visible.
- Product names use approximately 20 px type, supporting copy uses 14–15 px, and descriptions clamp to two lines.
- Keep the real compliant price behavior; when price is intentionally absent, show “See on Amazon”.
- Use one small ArrowUpRight icon for the detail affordance. Do not add ratings, reviews, prices, discounts, or stock data.
- Category images use a shorter landscape ratio. Guide cards follow the same quiet metadata and typography system.
- Search, category filtering, empty states, and result counts retain their current behavior.

### Secondary public pages

- Shorten listing-page titles to remain within two lines at desktop, tablet, and phone widths.
- Apply the same type, palette, spacing, card, filter, and footer system to categories, products, and guides.
- Product and guide detail routes inherit the scoped public type and palette without changing their data or outbound-link logic.

## Accessibility and behavior

- Keep semantic headings, labels, navigation landmarks, native links, and 44 px minimum controls.
- Maintain visible keyboard focus and sufficient text contrast.
- Motion never hides essential content and respects `prefers-reduced-motion`.
- Product and category cards remain single descriptive links with useful accessible image names.
- No checkout, cart, inventory, account, or merchant behavior is added.

## Verification

- Add rendering contracts for the compact card and revised public shell/home copy.
- Run focused tests first, followed by the full test, lint, typecheck, and production build suite.
- Inspect the homepage in a real browser at 1440, 768, and 390 px; check title line count, card density, image containment, navigation, focus, overflow, and reduced motion.
- Run taste lint and taste browser inspection, write a screenshot-based critique, fix the three most visible issues, and inspect again.

