begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = any(required_roles)
  );
$$;

revoke all on function private.has_role(text[]) from public;
grant execute on function private.has_role(text[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_products enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.product_clicks enable row level security;
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.activity_logs enable row level security;
alter table public.media_assets enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.product_images from anon, authenticated;
revoke all on table public.tags from anon, authenticated;
revoke all on table public.product_tags from anon, authenticated;
revoke all on table public.articles from anon, authenticated;
revoke all on table public.article_products from anon, authenticated;
revoke all on table public.affiliate_links from anon, authenticated;
revoke all on table public.product_clicks from anon, authenticated;
revoke all on table public.site_settings from anon, authenticated;
revoke all on table public.navigation_items from anon, authenticated;
revoke all on table public.activity_logs from anon, authenticated;
revoke all on table public.media_assets from anon, authenticated;

grant select on table public.categories, public.products, public.product_images,
  public.tags, public.product_tags, public.articles, public.article_products,
  public.site_settings, public.navigation_items, public.media_assets to anon;

grant select, insert, update, delete on table public.categories, public.products,
  public.product_images, public.tags, public.product_tags, public.articles,
  public.article_products, public.affiliate_links, public.site_settings,
  public.navigation_items, public.media_assets to authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.product_clicks, public.activity_logs to authenticated;

create policy categories_public_read
on public.categories for select
to anon, authenticated
using (is_active = true);

create policy categories_staff_all
on public.categories for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy products_public_read
on public.products for select
to anon, authenticated
using (
  status = 'published'
  and published_at <= now()
  and exists (
    select 1 from public.categories
    where categories.id = products.category_id
      and categories.is_active = true
  )
);

create policy products_staff_all
on public.products for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy product_images_public_read
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    join public.categories on categories.id = products.category_id
    where products.id = product_images.product_id
      and products.status = 'published'
      and products.published_at <= now()
      and categories.is_active = true
  )
);

create policy product_images_staff_all
on public.product_images for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy tags_public_read
on public.tags for select
to anon, authenticated
using (
  exists (
    select 1 from public.product_tags
    join public.products on products.id = product_tags.product_id
    where product_tags.tag_id = tags.id
      and products.status = 'published'
      and products.published_at <= now()
  )
);

create policy tags_staff_all
on public.tags for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy product_tags_public_read
on public.product_tags for select
to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_tags.product_id
      and products.status = 'published'
      and products.published_at <= now()
  )
);

create policy product_tags_staff_all
on public.product_tags for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy articles_public_read
on public.articles for select
to anon, authenticated
using (
  status = 'published'
  and published_at <= now()
  and (
    category_id is null
    or exists (
      select 1 from public.categories
      where categories.id = articles.category_id
        and categories.is_active = true
    )
  )
);

create policy articles_staff_all
on public.articles for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy article_products_public_read
on public.article_products for select
to anon, authenticated
using (
  exists (
    select 1 from public.articles
    where articles.id = article_products.article_id
      and articles.status = 'published'
      and articles.published_at <= now()
  )
  and exists (
    select 1 from public.products
    where products.id = article_products.product_id
      and products.status = 'published'
      and products.published_at <= now()
  )
);

create policy article_products_staff_all
on public.article_products for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy media_assets_public_read
on public.media_assets for select
to anon, authenticated
using (storage_bucket = 'public-media' and deleted_at is null);

create policy media_assets_staff_all
on public.media_assets for all
to authenticated
using (private.has_role(array['admin']))
with check (private.has_role(array['admin']));

create policy affiliate_links_staff_all
on public.affiliate_links for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy product_clicks_staff_read
on public.product_clicks for select
to authenticated
using (private.has_role(array['admin']));

create policy site_settings_public_read
on public.site_settings for select
to anon, authenticated
using (is_public = true);

create policy site_settings_staff_read
on public.site_settings for select
to authenticated
using (private.has_role(array['admin', 'editor']));

create policy site_settings_admin_all
on public.site_settings for all
to authenticated
using (private.has_role(array['admin']))
with check (private.has_role(array['admin']));

create policy site_settings_editor_insert
on public.site_settings for insert
to authenticated
with check (
  private.has_role(array['editor'])
  and setting_key !~ '^(legal|security|users)\.'
);

create policy site_settings_editor_update
on public.site_settings for update
to authenticated
using (
  private.has_role(array['editor'])
  and setting_key !~ '^(legal|security|users)\.'
)
with check (
  private.has_role(array['editor'])
  and setting_key !~ '^(legal|security|users)\.'
);

create policy navigation_items_public_read
on public.navigation_items for select
to anon, authenticated
using (is_active = true);

create policy navigation_items_staff_all
on public.navigation_items for all
to authenticated
using (private.has_role(array['admin', 'editor']))
with check (private.has_role(array['admin', 'editor']));

create policy profiles_self_or_admin_read
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or private.has_role(array['admin']));

create policy profiles_self_update
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy profiles_admin_all
on public.profiles for all
to authenticated
using (private.has_role(array['admin']))
with check (private.has_role(array['admin']));

create policy activity_logs_admin_read
on public.activity_logs for select
to authenticated
using (private.has_role(array['admin']));

commit;
