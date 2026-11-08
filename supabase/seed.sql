insert into public.categories (
  id,
  name,
  slug,
  description,
  display_order,
  is_featured,
  is_active
)
values
  (gen_random_uuid(), 'Kitchen Essentials', 'kitchen-essentials', 'Practical tools, cookware, and organizers for everyday cooking.', 10, true, true),
  (gen_random_uuid(), 'Bedroom Essentials', 'bedroom-essentials', 'Comfort, lighting, and storage ideas for a calmer room.', 20, true, true),
  (gen_random_uuid(), 'Bathroom Essentials', 'bathroom-essentials', 'Useful organizers and accessories for daily routines.', 30, true, true),
  (gen_random_uuid(), 'Home Organization', 'home-organization', 'Storage and space-saving ideas for the places that work hardest.', 40, true, true),
  (gen_random_uuid(), 'Cleaning Essentials', 'cleaning-essentials', 'Practical cleaning tools chosen for real household routines.', 50, false, true),
  (gen_random_uuid(), 'Living Room', 'living-room', 'Comfortable, useful details for shared living spaces.', 60, false, true),
  (gen_random_uuid(), 'Smart Home', 'smart-home', 'Connected household accessories explained in practical terms.', 70, false, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    display_order = excluded.display_order,
    is_featured = excluded.is_featured,
    is_active = excluded.is_active,
    updated_at = now();
