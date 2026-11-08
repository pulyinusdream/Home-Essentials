import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ProductStatus } from "@/components/products/product-status";
import { getProductEditorRecord } from "@/services/products/queries";
import type { Json } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Product preview",
  robots: { index: false, follow: false },
};

export default async function ProductPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getProductEditorRecord(id);
  if (!record) notFound();

  const product = record.product;
  const features = jsonStringArray(product.features);
  const pros = jsonStringArray(product.pros);
  const cons = jsonStringArray(product.cons);

  return (
    <div className="admin-page preview-page">
      <header className="preview-toolbar">
        <Link href={`/admin/products/${id}/edit`}>
          <ArrowLeft aria-hidden="true" />
          Back to editor
        </Link>
        <div>
          <span>Private preview</span>
          <ProductStatus status={product.status} />
        </div>
      </header>

      <article className="product-preview">
        <div className="product-preview__media">
          {product.main_image_url ? (
            <div
              className="product-preview__image"
              role="img"
              aria-label={product.main_image_alt || product.name}
              style={{ backgroundImage: cssImageUrl(product.main_image_url) }}
            />
          ) : (
            <div className="product-preview__image product-preview__image--empty">
              Add a primary image in the editor
            </div>
          )}
        </div>
        <div className="product-preview__copy">
          <p className="eyebrow">{product.subcategory || "Home essential"}</p>
          <h1>{product.name}</h1>
          {product.brand ? <p className="product-preview__brand">By {product.brand}</p> : null}
          <p className="product-preview__short">
            {product.short_description || "Add a short description in the editor."}
          </p>
          <div className="product-preview__disclosure">
            As an Amazon Associate, Home Essentials earns from qualifying purchases.
          </div>
          {record.affiliateLink?.affiliate_url ? (
            <a
              className="button button--primary"
              href={record.affiliateLink.affiliate_url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
            >
              View verified Amazon link
              <ExternalLink aria-hidden="true" />
            </a>
          ) : (
            <button className="button button--primary" type="button" disabled>
              Amazon link not ready
            </button>
          )}
        </div>
      </article>

      <div className="product-preview-details">
        <section>
          <p className="eyebrow">Our recommendation</p>
          <h2>Why it may earn a place at home</h2>
          <p>{product.recommendation || "Add the editorial recommendation in the editor."}</p>
        </section>
        {features.length > 0 ? (
          <section><h2>Key features</h2><ul>{features.map((item) => <li key={item}>{item}</li>)}</ul></section>
        ) : null}
        <div className="product-preview-columns">
          {pros.length > 0 ? <section><h2>What stands out</h2><ul>{pros.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
          {cons.length > 0 ? <section><h2>What to consider</h2><ul>{cons.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
        </div>
      </div>
    </div>
  );
}

function jsonStringArray(value: Json) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function cssImageUrl(value: string) {
  return `url(${JSON.stringify(value)})`;
}
