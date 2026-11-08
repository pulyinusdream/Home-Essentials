begin;

create index categories_active_order_idx
  on public.categories (is_active, display_order, name);
create index categories_featured_order_idx
  on public.categories (is_featured, display_order)
  where is_active = true;

create index products_status_published_at_idx
  on public.products (status, published_at desc);
create index products_category_status_idx
  on public.products (category_id, status, display_order, published_at desc);
create index products_featured_idx
  on public.products (is_featured, homepage_placement, published_at desc)
  where status = 'published';
create index products_name_search_idx
  on public.products using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(short_description, '')));

create index product_images_product_order_idx
  on public.product_images (product_id, is_primary desc, display_order);
create unique index product_images_one_primary_idx
  on public.product_images (product_id)
  where is_primary = true;
create index product_tags_tag_product_idx
  on public.product_tags (tag_id, product_id);

create index articles_status_published_at_idx
  on public.articles (status, published_at desc);
create index articles_category_status_idx
  on public.articles (category_id, status, published_at desc);
create index articles_title_search_idx
  on public.articles using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '')));
create index article_products_product_order_idx
  on public.article_products (product_id, display_order);

create unique index affiliate_links_active_product_idx
  on public.affiliate_links (product_id, marketplace)
  where status = 'active';
create index affiliate_links_status_verified_idx
  on public.affiliate_links (status, last_verified_at);

create index product_clicks_clicked_at_idx
  on public.product_clicks (clicked_at desc);
create index product_clicks_product_date_idx
  on public.product_clicks (product_id, clicked_at desc);
create index product_clicks_article_date_idx
  on public.product_clicks (article_id, clicked_at desc)
  where article_id is not null;
create index product_clicks_utm_source_date_idx
  on public.product_clicks (utm_source, clicked_at desc)
  where utm_source is not null;
create index product_clicks_session_hash_idx
  on public.product_clicks (session_hash, clicked_at desc)
  where session_hash is not null;

create index media_assets_created_at_idx
  on public.media_assets (created_at desc)
  where deleted_at is null;
create index activity_logs_created_at_idx
  on public.activity_logs (created_at desc);
create index activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, created_at desc);
create index navigation_items_location_order_idx
  on public.navigation_items (location, is_active, display_order);

commit;
