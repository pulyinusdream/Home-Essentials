import Link from "next/link";

import { getCompliantPrice } from "@/services/public/visibility";
import type { PublicProductCard } from "@/services/public/repository";

export function ProductCard({ product }: { product: PublicProductCard }) {
  const price = getCompliantPrice({
    displayPrice: product.display_price,
    currency: product.currency,
    priceSource: product.price_source,
    priceVerifiedAt: product.price_verified_at,
  });

  return (
    <article className="public-product-card">
      <Link href={`/products/${product.slug}`}>
        <div className="public-product-card__media">
          {product.main_image_url ? (
            <div
              className="public-product-card__image"
              role="img"
              aria-label={product.main_image_alt || product.name}
              style={{ backgroundImage: cssImageUrl(product.main_image_url) }}
            />
          ) : (
            <div className="public-product-card__image public-product-card__image--empty" aria-hidden="true" />
          )}
          {product.is_featured ? <span>Editor&apos;s pick</span> : null}
        </div>
        <div className="public-product-card__copy">
          <p>{product.category?.name || "Home essential"}</p>
          <h2>{product.name}</h2>
          {product.short_description ? <span>{product.short_description}</span> : null}
          <div>
            {price ? (
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: price.currency,
                }).format(price.amount)}
              </strong>
            ) : (
              <strong>See recommendation</strong>
            )}
            <span aria-hidden="true">View details</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function cssImageUrl(value: string) {
  return `url(${JSON.stringify(value)})`;
}
