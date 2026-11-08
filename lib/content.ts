export const categories = [
  { slug: 'kitchen', name: 'Kitchen', title: 'A kitchen that works.', description: 'Make room for the cooking, the coffee, and the everyday. Start with practical organizers and tools that fit your space.', image: 'kitchen', alt: 'Warm wood kitchen with uncluttered counters', note: 'For the heart of the home' },
  { slug: 'bedroom', name: 'Bedroom', title: 'Room to unwind.', description: 'Thoughtful ideas for a calmer bedside, better storage, and a room that feels like yours.', image: 'bedroom', alt: 'Bright bedroom with neutral bedding and natural textures', note: 'A softer end to the day' },
  { slug: 'bathroom', name: 'Bathroom', title: 'A little daily calm.', description: 'Keep the things you reach for close, and the rest neatly tucked away. Small changes for your everyday routine.', image: 'bathroom', alt: 'Light-filled bathroom with a clean vanity', note: 'Simple routines, considered details' },
  { slug: 'organization', name: 'Organization', title: 'Everything in its place.', description: 'Less searching, more space. Useful storage ideas for drawers, shelves, and the corners that work a little harder.', image: 'organization', alt: 'Organized shelving and warm natural materials', note: 'Make space for everyday living' },
] as const;
export type CategorySlug = typeof categories[number]['slug'];
export type Product = {
  slug: string; name: string; shortName: string; brand: string; asin: string;
  categories: CategorySlug[]; summary: string; use: string; consider: string;
  features: string[]; assessment: string; source: string; sourceLabel: string;
};
export const products: Product[] = [
  {
    slug: 'joseph-joseph-drawerstore', name: 'Joseph Joseph DrawerStore Compact Utensil Organizer', shortName: 'A smarter cutlery drawer', brand: 'Joseph Joseph', asin: 'B072R6CLRC', categories: ['kitchen','organization'],
    summary: 'Overlapping compartments make this narrow organizer worth considering when drawer width is at a premium.',
    use: 'Narrow kitchen drawers', consider: 'Measure your drawer height before ordering. The manufacturer specifies a minimum internal height of 3¼ inches.',
    features: ['Stacked compartments for cutlery', 'Non-slip feet', 'Small gray version'],
    assessment: 'The appeal is the layout: cutlery overlaps vertically rather than spreading across a wide tray. That leaves more of a drawer available for other tools. It is a focused option for flatware, rather than a home for every spatula and ladle. A conventional wide tray may be easier to scan if you have plenty of drawer space.',
    source: 'https://www.josephjoseph.com/products/drawerstore-compact-cutlery-organiser-grey', sourceLabel: 'Joseph Joseph specifications',
  },
  {
    slug: 'oxo-expandable-utensil-organizer', name: 'OXO Good Grips Large Expandable Utensil Organizer', shortName: 'Give your tools some room', brand: 'OXO', asin: 'B016AIEQFU', categories: ['kitchen','organization'],
    summary: 'An adjustable organizer for a wider drawer, with movable dividers and extra space for longer tools.',
    use: 'Wide kitchen drawers', consider: 'This is the large version. Check the full inside width, depth, and clearance of your drawer against the manufacturer’s dimensions.',
    features: ['Adjustable dividers', 'Expandable side area', 'Non-slip feet'],
    assessment: 'Choose the expandable approach when your drawer has room to spare but its contents keep shifting. The movable dividers give the organizer a different role from a narrow, stacked tray: it can spread out to accommodate more tools. Expansion does not solve a shallow or short drawer, so measurements still come first.',
    source: 'https://www.oxo.com/large-expandable-utensil-organizer-white.html', sourceLabel: 'OXO product specifications',
  },
  {
    slug: 'simplehuman-sink-caddy', name: 'simplehuman Sink Caddy', shortName: 'A clearer sink space', brand: 'simplehuman', asin: 'B002WGHKWQ', categories: ['kitchen'],
    summary: 'An in-sink holder with divided storage for the brushes and sponges that otherwise gather around the faucet.',
    use: 'Keeping sink tools together', consider: 'Check that the suction cups and ledge hanger suit your sink shape and material. Leave room for washing larger pans.',
    features: ['Divided compartments', 'Vented base', 'Suction cups and wire ledge hanger'],
    assessment: 'Moving small cleaning tools inside the sink can free up counter space. This design uses both suction cups and a hanger, so the fit of the sink matters as much as the available storage. Think through where your largest pot sits before choosing a position. Regular cleaning of the holder is still part of the routine.',
    source: 'https://www.amazon.com/dp/B002WGHKWQ', sourceLabel: 'Amazon.com product listing',
  },
  {
    slug: 'joseph-joseph-easystore', name: 'Joseph Joseph EasyStore Stainless-Steel Toothbrush Holder, Small', shortName: 'Tidy up your morning', brand: 'Joseph Joseph', asin: 'B07YLHG8V6', categories: ['bathroom','organization'],
    summary: 'A small divided countertop holder for keeping toothbrushes and other daily bathroom essentials together.',
    use: 'A shared bathroom vanity', consider: 'Compare the compartment openings with your toothbrush handles, especially larger electric models.',
    features: ['Small countertop format', 'Divided storage', 'Stainless-steel finish'],
    assessment: 'A divided holder gives a daily routine one defined place on the counter. The small version makes sense when you want to group a few items without dedicating a large section of the vanity to storage. Capacity depends on the size of the things you put inside; check your actual items rather than assuming every toothbrush or tube will fit.',
    source: 'https://www.amazon.com/dp/B07YLHG8V6', sourceLabel: 'Amazon.com product listing',
  },
  {
    slug: 'honeywell-turboforce-ht900', name: 'Honeywell TurboForce HT900 Air Circulator', shortName: 'A breeze for your bedside', brand: 'Honeywell', asin: 'B001R1RXUG', categories: ['bedroom'],
    summary: 'A compact tabletop fan with three speeds and a pivoting head for directing airflow where you want it.',
    use: 'Personal airflow in a bedroom', consider: 'This is a corded fan, not an air conditioner. If sound matters at bedtime, assess it in your room during the retailer’s return period.',
    features: ['Three speed settings', '90-degree pivoting head', 'Compact tabletop format'],
    assessment: 'The useful distinction here is direction: the pivoting head lets you aim airflow rather than moving the entire fan. It may suit a bedroom where a larger floor fan would be awkward. Keep the cord route, outlet location, and usable bedside surface in mind. No fan can promise a particular sleep result, and perceived noise varies from person to person.',
    source: 'https://www.amazon.com/dp/B001R1RXUG', sourceLabel: 'Amazon.com product listing',
  },
];

export type Guide = { slug: string; title: string; description: string; category: CategorySlug; minutes: number; sections: { title: string; text: string }[]; products: string[] };
export const guides: Guide[] = [
  { slug: 'small-kitchen-reset', title: 'The small kitchen reset', description: 'Start with one drawer, one counter, and the things you use every day.', category: 'kitchen', minutes: 4, products: ['joseph-joseph-drawerstore','oxo-expandable-utensil-organizer','simplehuman-sink-caddy'], sections: [
    {title: 'Start with what you reach for', text: 'A useful kitchen is organized around your routine. Before shopping, take everything out of one drawer and separate daily tools from occasional ones. Put the everyday group nearest the place you use it. A coffee measure belongs near the coffee; a peeler belongs near the prep area. This small inventory can make an organizer unnecessary, or make the right shape much easier to choose.'},
    {title: 'Measure before you organize', text: 'Measure the usable inside width, depth, and height, including any runners, screws, or lips that reduce the clearance. Write those measurements down. A compact organizer trades width for stacked compartments; an expandable tray needs a wider drawer. Compare those approaches against your utensils and your actual drawer, rather than buying the largest tray that appears to fit.'},
    {title: 'Give the counter a clear job', text: 'Pick one area that stays available for preparation. Move seldom-used appliances out of that area only if you can store and retrieve them comfortably. Keep brushes and sponges in a dedicated holder that you can clean. If you choose an in-sink caddy, check that it leaves room for your largest pan and that its mounting system suits your sink.'},
    {title: 'Buy one change at a time', text: 'Try the new layout for a week before adding more storage. Notice what becomes awkward: a tray that catches a drawer, an appliance with no reachable outlet, or a holder that is difficult to clean. The best next purchase solves that observed problem. Matching containers can look appealing, but a system only earns its space when it is easy to use on a busy day.'},
  ]},
  { slug: 'cutlery-organizer-comparison', title: 'Compact or expandable?', description: 'Two different approaches to the same messy cutlery drawer.', category: 'organization', minutes: 3, products: ['joseph-joseph-drawerstore','oxo-expandable-utensil-organizer'], sections: [
    {title: 'Choose by drawer shape', text: 'The Joseph Joseph DrawerStore and the OXO Large Expandable Utensil Organizer solve different space problems. DrawerStore overlaps cutlery compartments in a narrow footprint. OXO uses adjustable dividers and an expandable area. Neither is automatically the better choice: one preserves width, while the other makes more use of a wide drawer.'},
    {title: 'When compact makes sense', text: 'A compact tray is worth considering if flatware currently takes over a narrow drawer. Joseph Joseph specifies a minimum internal drawer height of 3¼ inches for its compact design. Check that clearance at the lowest point. Also think about how much cutlery you regularly store and whether larger serving tools need their own area.'},
    {title: 'When expandable makes sense', text: 'An expandable tray makes sense when the drawer has usable width and your tools need separate compartments. OXO’s large organizer includes movable dividers and a side area for longer items. Check the manufacturer’s closed and expanded measurements before ordering. A tray that expands sideways still needs the correct front-to-back depth.'},
    {title: 'Our practical recommendation', text: 'Start with your measurements and the items you own. Consider the compact approach for a narrow flatware drawer, and the expandable approach for a wide mixed-tool drawer. This comparison is based on published product information, not a hands-on test. Follow the source links on each product guide for current specifications and care instructions.'},
  ]},
  { slug: 'calmer-bedside', title: 'A calmer bedside', description: 'Make the last few minutes of your day a little less cluttered.', category: 'bedroom', minutes: 3, products: ['honeywell-turboforce-ht900'], sections: [
    {title: 'Keep the surface useful', text: 'Start with what you use before sleeping and just after waking. A book, a glass of water, and one light may be enough. Put the occasional items in a drawer or nearby basket. Before buying a new bedside table, measure the available floor area and the height of your mattress so the surface will be comfortable to reach.'},
    {title: 'Plan the light and the cords', text: 'Choose lighting around the way you read and move through the room. Check that a lamp’s switch is reachable from bed and that its base leaves enough surface for other essentials. Route cords away from walking paths. If you share a room, think about where the light falls rather than choosing by appearance alone.'},
    {title: 'Make room for personal comfort', text: 'If you use a bedside fan, allow space for its base and an unobstructed cord route. A compact fan with a pivoting head lets you direct airflow without using a larger floor footprint. Sound preferences are personal; compare the settings in the room where you intend to use it. A fan moves air and is not a replacement for air conditioning.'},
    {title: 'Store only what fits', text: 'Under-bed storage can be useful for seasonal bedding, but measure the lowest clearance and the path needed to pull a container out. Avoid overfilling a soft bag until it becomes difficult to close or move. Keep daily items somewhere easier to reach. The aim is a bedside routine with fewer obstacles, rather than a room with more organizers.'},
  ]},
  { slug: 'bathroom-counter-reset', title: 'Reset your bathroom counter', description: 'A place for the daily things, and room around them.', category: 'bathroom', minutes: 3, products: ['joseph-joseph-easystore'], sections: [
    {title: 'Edit before adding storage', text: 'Clear the counter and group what you use each day. Put occasional items elsewhere if you have suitable storage. Check the sizes of the toothbrushes, tubes, and bottles you actually own. A countertop organizer should fit that group, not a hypothetical set of matching accessories.'},
    {title: 'Leave room for cleaning', text: 'A simple arrangement is easier to lift and wipe around. Compare the base size of a holder with the clear space beside your sink. If you share the vanity, divided compartments can give items a more defined place. Check the manufacturer’s cleaning instructions before placing any part in a dishwasher or soaking it.'},
    {title: 'Match storage to the location', text: 'A dry countertop and a wet shower are different settings. Choose holders for the place you intend to use them. With mounted storage, read the manufacturer’s surface and installation requirements; a convenient-looking spot is not always a compatible one. Keep heavy or breakable items where they can be reached safely.'},
    {title: 'Let the routine decide', text: 'Use the arrangement for several mornings before changing more. If items keep migrating back to the counter, their storage may be inconvenient. Move the storage closer or reduce what it holds. Buying another organizer is only useful if it addresses a real gap in the routine.'},
  ]},
];

export function categoryBySlug(slug: string) { return categories.find(c => c.slug === slug); }
export function productBySlug(slug: string) { return products.find(p => p.slug === slug); }
export function guideBySlug(slug: string) { return guides.find(g => g.slug === slug); }
