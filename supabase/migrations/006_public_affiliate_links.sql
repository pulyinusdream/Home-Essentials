begin;

grant select on table public.affiliate_links to anon;

create policy affiliate_links_public_read
on public.affiliate_links for select
to anon, authenticated
using (
  status = 'active'
  and last_verified_at is not null
  and exists (
    select 1
    from public.products
    join public.categories on categories.id = products.category_id
    where products.id = affiliate_links.product_id
      and products.status = 'published'
      and products.published_at <= now()
      and categories.is_active = true
  )
);

comment on policy affiliate_links_public_read on public.affiliate_links is
  'Exposes the exact Special Link only for a live product so public anchors can point directly to Amazon without link cloaking.';

commit;
