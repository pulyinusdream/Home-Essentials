begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null check (role in ('admin', 'editor')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  image_url text,
  alt_text text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'public-media',
  storage_path text unique not null,
  public_url text not null,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 5242880),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text not null default '',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 240),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  brand text,
  model text,
  internal_reference text unique,
  subcategory text,
  short_description text,
  description text,
  specifications jsonb not null default '{}'::jsonb check (jsonb_typeof(specifications) = 'object'),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  recommendation text,
  benefits jsonb not null default '[]'::jsonb check (jsonb_typeof(benefits) = 'array'),
  pros jsonb not null default '[]'::jsonb check (jsonb_typeof(pros) = 'array'),
  cons jsonb not null default '[]'::jsonb check (jsonb_typeof(cons) = 'array'),
  ideal_for text,
  things_to_consider text,
  recommended_use text,
  main_image_url text,
  main_image_alt text,
  display_price numeric(12,2) check (display_price is null or display_price >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  price_source text not null default 'none' check (price_source in ('none', 'amazon_api')),
  price_verified_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'archived')),
  is_featured boolean not null default false,
  homepage_placement integer,
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  focus_keyword text,
  canonical_url text,
  social_title text,
  social_description text,
  social_image_url text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((display_price is null and price_source = 'none') or (display_price is not null and price_source = 'amazon_api')),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_asset_id uuid references public.media_assets(id) on delete restrict,
  image_url text not null,
  storage_path text,
  alt_text text not null default '',
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, display_order)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 240),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  content jsonb not null default '[]'::jsonb check (jsonb_typeof(content) = 'array'),
  featured_image_url text,
  featured_image_alt text,
  featured_media_asset_id uuid references public.media_assets(id) on delete restrict,
  author_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'archived')),
  seo_title text,
  seo_description text,
  focus_keyword text,
  canonical_url text,
  social_title text,
  social_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'published' and published_at is not null) or status <> 'published')
);

create table public.article_products (
  article_id uuid not null references public.articles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  note text,
  primary key (article_id, product_id)
);

create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  marketplace text not null default 'US' check (marketplace ~ '^[A-Z]{2}$'),
  asin text check (asin is null or asin ~ '^[A-Z0-9]{10}$'),
  tracking_id text,
  affiliate_url text not null check (affiliate_url ~* '^https://([a-z0-9-]+\.)*amazon\.com/'),
  status text not null default 'unverified' check (status in ('active', 'inactive', 'unverified', 'broken')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  article_id uuid references public.articles(id) on delete set null,
  session_hash text,
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent_family text,
  clicked_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null check (setting_key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  setting_value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null check (url like '/%' or url ~* '^https://'),
  location text not null default 'header' check (location in ('header', 'footer')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

comment on table public.product_clicks is 'Outbound click events only; not Amazon purchases, sales, or commission records.';
comment on column public.affiliate_links.affiliate_url is 'Exact verified affiliate destination; do not shorten or rewrite.';

commit;
