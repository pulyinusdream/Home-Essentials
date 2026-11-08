begin;
select plan(10);

insert into auth.users (id, email)
values
  ('00000000-0000-4000-8000-000000000001', 'admin@example.test'),
  ('00000000-0000-4000-8000-000000000002', 'editor@example.test')
on conflict (id) do nothing;

insert into public.profiles (id, full_name, email, role)
values
  ('00000000-0000-4000-8000-000000000001', 'Test Administrator', 'admin@example.test', 'admin'),
  ('00000000-0000-4000-8000-000000000002', 'Test Editor', 'editor@example.test', 'editor')
on conflict (id) do update set role = excluded.role;

insert into public.products (
  id,
  category_id,
  name,
  slug,
  short_description,
  description,
  recommendation,
  main_image_url,
  main_image_alt,
  seo_description
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    (select id from public.categories where slug = 'kitchen-essentials'),
    'Published test product',
    'published-test-product',
    'A published product used to verify public affiliate-link visibility.',
    'A complete published product used only inside the rolled-back policy test.',
    'Recommended for validating the public read policy.',
    'https://images.example.test/published-product.jpg',
    'Published test product',
    'Policy test product for public affiliate-link visibility.'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    (select id from public.categories where slug = 'kitchen-essentials'),
    'Draft test product',
    'draft-test-product',
    'A draft product whose link must remain private.',
    'A complete draft product used only inside the rolled-back policy test.',
    'Kept private to validate the public read policy.',
    'https://images.example.test/draft-product.jpg',
    'Draft test product',
    'Policy test product whose affiliate link must remain private.'
  );

insert into public.affiliate_links (
  id,
  product_id,
  marketplace,
  asin,
  tracking_id,
  affiliate_url,
  status,
  last_verified_at
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'US',
    'B000000001',
    'example-20',
    'https://www.amazon.com/dp/B000000001?tag=example-20',
    'active',
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'US',
    'B000000002',
    'example-20',
    'https://www.amazon.com/dp/B000000002?tag=example-20',
    'active',
    now()
  );

update public.products
set status = 'published'
where id = '10000000-0000-4000-8000-000000000001';

set local role anon;
select is(
  (select count(*)::integer from public.categories),
  7,
  'anonymous visitors can read the seven active seed categories'
);
select throws_ok(
  $$insert into public.products (name, slug) values ('Blocked', 'blocked')$$,
  '42501',
  null,
  'anonymous visitors cannot create products'
);
select is(
  (select count(*)::integer from public.affiliate_links),
  1,
  'anonymous visitors can read only the link for a published product'
);
select is(
  (select affiliate_url from public.affiliate_links),
  'https://www.amazon.com/dp/B000000001?tag=example-20',
  'the public link is the exact verified Amazon Special Link'
);
select throws_ok(
  $$insert into public.affiliate_links (product_id, affiliate_url) values ('10000000-0000-4000-8000-000000000001', 'https://www.amazon.com/dp/B000000003')$$,
  '42501',
  null,
  'anonymous visitors cannot create affiliate links'
);
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000002';
select ok(private.has_role(array['editor']), 'database resolves the editor role from profiles');
select ok(not private.has_role(array['admin']), 'editor is not treated as an administrator');
select throws_ok(
  $$update public.profiles set role = 'admin' where id = '00000000-0000-4000-8000-000000000002'$$,
  'P0001',
  'Only administrators may change profile roles or account email',
  'editor cannot promote their own role'
);
select is(
  (select count(*)::integer from public.activity_logs),
  0,
  'editor cannot read administrator activity logs'
);
reset role;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000001';
select ok(private.has_role(array['admin']), 'database resolves the administrator role from profiles');
reset role;

select * from finish();
rollback;
