# Home Essentials design system

## Direction

The public publication feels like a carefully edited home journal: warm paper, decisive interior photography, restrained serif headlines, practical reading copy, and flat, quiet actions. The admin application is an extension of that world in Operate mode: a warm cream L-frame around a white working sheet, hairline divisions, compact typography, and gold reserved for the brand mark, selected state, and meaningful data.

The CMS style is `framed-sheet`, seed `1629723432`, kept to the confirmed palette and type. Its recognizable move is one tinted frame for navigation and the top bar, with the working page inset eight pixels and separated by a single soft edge—never a shadow.

## Tokens

- Charcoal: `#252525`; warm cream: `#F8F6F1`; white: `#FFFFFF`.
- Gold: `#9A6C2F` for accessible text/marks; supplied gold `#C69A5B` for decorative large marks and pale tints only.
- Muted ink: `#625E58`; soft border: `#E7E4DE`; raised ground: `#F1EEE7`.
- Negative: `#A62C2C`; positive: `#266845`; warning ink: `#7A4A05`.
- Public display: Playfair Display. Body and application: Inter. Tabular figures enabled wherever values align.
- Admin scale: 12 / 14 / 16 / 24 px. Public display: 42–80 px, always within two lines.
- Admin sheet radius 16 px, panels 8 px, controls 6 px. Public media is square or lightly eased at 4 px.
- Controls are at least 44 px on touch layouts. Desktop admin controls may be 36–40 px where pointer use is expected.

## Public composition

Large split hero, editorial image sequences, asymmetric category rows, restrained product cards, readable guide measures, and a substantial typographic footer. No gradient, glass, decorative shadow, icon-card grid, fake social proof, or ratings. One primary action per viewport; secondary actions are text or outline links.

## Admin composition

The product name and publication scope stay visible in the frame. Titles are nouns at 24 px. Overview numbers share one divided strip and come from real queries. Full lists use sentence-case headers, rules instead of zebra stripes, right-aligned tabular figures, and two-line mobile rows. The product editor keeps a sticky section index and makes publishing readiness visible without turning the form into a step wizard.

## States

Loading preserves final geometry without shimmer. Empty states retain their frame and place the next truthful action where data will appear. Errors name what failed and how to recover. Disabled controls remain readable and explain why. Motion is feedback only in the CMS; the public site receives one restrained entrance that disappears under reduced motion.
