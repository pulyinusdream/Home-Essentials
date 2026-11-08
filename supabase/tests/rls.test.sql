begin;
select plan(8);

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
select throws_ok(
  $$select * from public.affiliate_links$$,
  '42501',
  null,
  'anonymous visitors cannot read affiliate link rows'
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
