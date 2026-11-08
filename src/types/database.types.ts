export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StaffRole = "admin" | "editor";
export type PublicationStatus = "draft" | "pending_review" | "published" | "archived";
export type AffiliateLinkStatus = "active" | "inactive" | "unverified" | "broken";
export type PriceSource = "none" | "amazon_api";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: Relationship[];
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: StaffRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  alt_text: string | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaAssetRow = {
  id: string;
  storage_bucket: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  mime_type: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  file_size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  internal_reference: string | null;
  subcategory: string | null;
  short_description: string | null;
  description: string | null;
  specifications: Json;
  features: Json;
  recommendation: string | null;
  benefits: Json;
  pros: Json;
  cons: Json;
  ideal_for: string | null;
  things_to_consider: string | null;
  recommended_use: string | null;
  main_image_url: string | null;
  main_image_alt: string | null;
  display_price: number | null;
  currency: string;
  price_source: PriceSource;
  price_verified_at: string | null;
  status: PublicationStatus;
  is_featured: boolean;
  homepage_placement: number | null;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  social_title: string | null;
  social_description: string | null;
  social_image_url: string | null;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  media_asset_id: string | null;
  image_url: string;
  storage_path: string | null;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
};

export type TagRow = { id: string; name: string; slug: string; created_at: string };
export type ProductTagRow = { product_id: string; tag_id: string };

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: Json;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  featured_media_asset_id: string | null;
  author_id: string | null;
  category_id: string | null;
  status: PublicationStatus;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  social_title: string | null;
  social_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleProductRow = {
  article_id: string;
  product_id: string;
  display_order: number;
  note: string | null;
};

export type AffiliateLinkRow = {
  id: string;
  product_id: string;
  marketplace: string;
  asin: string | null;
  tracking_id: string | null;
  affiliate_url: string;
  status: AffiliateLinkStatus;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductClickRow = {
  id: string;
  product_id: string | null;
  affiliate_link_id: string | null;
  article_id: string | null;
  session_hash: string | null;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent_family: string | null;
  clicked_at: string;
};

export type SiteSettingRow = {
  id: string;
  setting_key: string;
  setting_value: Json;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
};

export type NavigationItemRow = {
  id: string;
  label: string;
  url: string;
  location: "header" | "footer";
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export type ActivityLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  metadata: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id" | "email" | "role">;
      categories: Table<CategoryRow, "name" | "slug">;
      media_assets: Table<MediaAssetRow, "storage_path" | "public_url" | "file_name" | "mime_type" | "file_size_bytes">;
      products: Table<ProductRow, "name" | "slug">;
      product_images: Table<ProductImageRow, "product_id" | "image_url">;
      tags: Table<TagRow, "name" | "slug">;
      product_tags: Table<ProductTagRow, "product_id" | "tag_id">;
      articles: Table<ArticleRow, "title" | "slug">;
      article_products: Table<ArticleProductRow, "article_id" | "product_id">;
      affiliate_links: Table<AffiliateLinkRow, "product_id" | "affiliate_url">;
      product_clicks: Table<ProductClickRow>;
      site_settings: Table<SiteSettingRow, "setting_key" | "setting_value">;
      navigation_items: Table<NavigationItemRow, "label" | "url">;
      activity_logs: Table<ActivityLogRow, "action">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
