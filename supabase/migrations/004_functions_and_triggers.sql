begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and not private.has_role(array['admin'])
    and (
      new.role is distinct from old.role
      or new.email is distinct from old.email
    ) then
    raise exception 'Only administrators may change profile roles or account email';
  end if;
  return new;
end;
$$;

create or replace function private.enforce_product_publish_readiness()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' then
    if new.category_id is null
      or nullif(btrim(new.description), '') is null
      or nullif(btrim(new.short_description), '') is null
      or nullif(btrim(new.recommendation), '') is null
      or nullif(btrim(new.main_image_url), '') is null
      or nullif(btrim(new.main_image_alt), '') is null
      or nullif(btrim(new.seo_description), '') is null then
      raise exception 'Published products require category, descriptions, recommendation, image alt text, and SEO description';
    end if;

    if not exists (
      select 1
      from public.categories
      where id = new.category_id and is_active = true
    ) then
      raise exception 'Published products require an active category';
    end if;

    if not exists (
      select 1
      from public.affiliate_links
      where product_id = new.id
        and marketplace = 'US'
        and status = 'active'
        and last_verified_at is not null
        and affiliate_url ~* '^https://([a-z0-9-]+\.)*amazon\.com/'
    ) then
      raise exception 'Published products require an active verified Amazon US affiliate link';
    end if;

    new.published_at = coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

create or replace function private.enforce_article_publish_readiness()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' then
    if nullif(btrim(new.excerpt), '') is null
      or jsonb_array_length(new.content) = 0
      or nullif(btrim(new.featured_image_url), '') is null
      or nullif(btrim(new.featured_image_alt), '') is null
      or nullif(btrim(new.seo_description), '') is null then
      raise exception 'Published articles require excerpt, content, featured image alt text, and SEO description';
    end if;
    new.published_at = coalesce(new.published_at, now());
  end if;

  return new;
end;
$$;

create or replace function private.audit_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  if tg_op = 'DELETE' then
    target_id = old.id;
  else
    target_id = new.id;
  end if;

  insert into public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description
  ) values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    target_id,
    initcap(lower(tg_op)) || ' ' || replace(tg_table_name, '_', ' ')
  );

  return null;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function private.prevent_profile_role_escalation() from public;
revoke all on function private.enforce_product_publish_readiness() from public;
revoke all on function private.enforce_article_publish_readiness() from public;
revoke all on function private.audit_content_change() from public;

create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function private.prevent_profile_role_escalation();

create trigger products_publish_readiness
before insert or update on public.products
for each row execute function private.enforce_product_publish_readiness();

create trigger articles_publish_readiness
before insert or update on public.articles
for each row execute function private.enforce_article_publish_readiness();

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();
create trigger affiliate_links_set_updated_at before update on public.affiliate_links
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
create trigger navigation_items_set_updated_at before update on public.navigation_items
for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();

create trigger categories_audit after insert or update or delete on public.categories
for each row execute function private.audit_content_change();
create trigger products_audit after insert or update or delete on public.products
for each row execute function private.audit_content_change();
create trigger articles_audit after insert or update or delete on public.articles
for each row execute function private.audit_content_change();
create trigger affiliate_links_audit after insert or update or delete on public.affiliate_links
for each row execute function private.audit_content_change();
create trigger site_settings_audit after insert or update or delete on public.site_settings
for each row execute function private.audit_content_change();

commit;
