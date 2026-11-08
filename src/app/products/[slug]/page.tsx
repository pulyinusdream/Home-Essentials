import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Share2 } from "lucide-react";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { PublicShell } from "@/components/public/public-shell";
import { buildEditorialMetadata } from "@/lib/seo/metadata";
import { fetchPublicProduct } from "@/services/public/repository";
import { getCompliantPrice } from "@/services/public/visibility";
import type { Json } from "@/types/database.types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchPublicProduct(slug);
  if (!product) return { title: "Product not found" };
  return buildEditorialMetadata({
    title: product.name,
    seoTitle: product.seo_title,
    description: product.seo_description || product.short_description || `Read our ${product.name} recommendation.`,
    canonicalPath: `/products/${product.slug}`,
    imageUrl: product.social_image_url || product.main_image_url,
    imageAlt: product.main_image_alt,
    type: "product",
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchPublicProduct(slug);
  if (!product) notFound();

  const price = getCompliantPrice({
    displayPrice: product.display_price,
    currency: product.currency,
    priceSource: product.price_source,
    priceVerifiedAt: product.price_verified_at,
  });
  const features = jsonStringArray(product.features);
  const benefits = jsonStringArray(product.benefits);
  const pros = jsonStringArray(product.pros);
  const cons = jsonStringArray(product.cons);
  const specifications = jsonRecord(product.specifications);
  const canonical = absoluteUrl(`/products/${product.slug}`);
  const pinterestUrl = pinterestShareUrl(canonical, product.main_image_url, product.social_description || product.short_description || product.name);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description,
    url: canonical,
    ...(product.main_image_url ? { image: [product.main_image_url] } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
  };

  return (
    <PublicShell>
      <script type="application/ld+json">{safeJson(productJsonLd)}</script>
      <div className="page-width public-breadcrumb-wrap">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Home finds", href: "/products" }, ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []), { label: product.name }]} />
      </div>
      <article className="public-product-detail page-width">
        <div className="public-product-detail__media">
          {product.main_image_url ? (
            <div role="img" aria-label={product.main_image_alt || product.name} style={{ backgroundImage: `url(${JSON.stringify(product.main_image_url)})` }} />
          ) : <div className="is-empty" aria-hidden="true" />}
        </div>
        <div className="public-product-detail__summary">
          <p className="eyebrow">{product.category?.name || product.subcategory || "Home essential"}</p>
          <h1>{product.name}</h1>
          {product.brand ? <p className="public-product-detail__brand">By {product.brand}</p> : null}
          <p className="public-product-detail__intro">{product.short_description}</p>
          {price ? (
            <div className="public-price">
              <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency }).format(price.amount)}</strong>
              <span>Price verified through approved Amazon data; availability may change.</span>
            </div>
          ) : null}
          <p className="public-affiliate-note">As an Amazon Associate I earn from qualifying purchases.</p>
          <div className="public-product-detail__actions">
            {product.affiliateUrl ? (
              <a className="button button--primary" href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noopener noreferrer">
                View on Amazon <ExternalLink aria-hidden="true" />
              </a>
            ) : (
              <span className="button button--primary" aria-disabled="true">Amazon link unavailable</span>
            )}
            <a className="share-link" href={pinterestUrl} target="_blank" rel="noopener noreferrer">
              <Share2 aria-hidden="true" /> Save to Pinterest
            </a>
          </div>
        </div>
      </article>

      <div className="public-product-content page-width">
        <section className="public-editorial-callout">
          <p className="eyebrow">Our recommendation</p>
          <h2>Why it may earn a place at home</h2>
          <p>{product.recommendation}</p>
        </section>
        {product.description ? <section><h2>Product overview</h2><p>{product.description}</p></section> : null}
        {features.length > 0 ? <section><h2>Key features</h2><ul>{features.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        {benefits.length > 0 ? <section><h2>Practical benefits</h2><ul>{benefits.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        {pros.length > 0 || cons.length > 0 ? (
          <div className="public-product-columns">
            {pros.length > 0 ? <section><h2>What stands out</h2><ul>{pros.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
            {cons.length > 0 ? <section><h2>What to consider</h2><ul>{cons.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
          </div>
        ) : null}
        {specifications.length > 0 ? (
          <section><h2>Specifications</h2><dl className="specification-table">{specifications.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>
        ) : null}
        {product.ideal_for || product.things_to_consider || product.recommended_use ? (
          <section className="public-decision-grid">
            {product.ideal_for ? <div><h2>Ideal for</h2><p>{product.ideal_for}</p></div> : null}
            {product.things_to_consider ? <div><h2>Before you choose</h2><p>{product.things_to_consider}</p></div> : null}
            {product.recommended_use ? <div><h2>Recommended use</h2><p>{product.recommended_use}</p></div> : null}
          </section>
        ) : null}
        <p className="public-commerce-note">Home Essentials does not sell or ship this item. Amazon is the merchant, and its current product details, price, availability, delivery, and returns apply.</p>
        <Link className="text-link" href="/products">Back to all home finds</Link>
      </div>
    </PublicShell>
  );
}

function jsonStringArray(value: Json) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function jsonRecord(value: Json) {
  if (!value || Array.isArray(value) || typeof value !== "object") return [] as Array<[string, string]>;
  return Object.entries(value).flatMap(([key, item]) =>
    typeof item === "string" || typeof item === "number" || typeof item === "boolean"
      ? [[key, String(item)] as [string, string]]
      : [],
  );
}

function absoluteUrl(path: string) {
  try { return new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000").toString(); }
  catch { return `http://127.0.0.1:3000${path}`; }
}

function pinterestShareUrl(url: string, image: string | null, description: string) {
  const target = new URL("https://www.pinterest.com/pin/create/button/");
  target.searchParams.set("url", url);
  if (image) target.searchParams.set("media", image);
  target.searchParams.set("description", description);
  return target.toString();
}

function safeJson(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
