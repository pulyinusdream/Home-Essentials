import Link from "next/link";

import type { ArticleBlock } from "@/lib/validation/article";

export type ArticleProductCard = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type RelatedArticleCard = {
  id: string;
  title: string;
  slug: string;
};

export function ArticleRenderer({
  blocks,
  productsById = new Map(),
  articlesById = new Map(),
}: {
  blocks: ArticleBlock[];
  productsById?: ReadonlyMap<string, ArticleProductCard>;
  articlesById?: ReadonlyMap<string, RelatedArticleCard>;
}) {
  return (
    <div className="article-body">
      {blocks.map((block) => {
        if (block.type === "paragraph") {
          return <p key={block.id}>{block.text}</p>;
        }
        if (block.type === "heading") {
          return block.level === 2 ? (
            <h2 key={block.id}>{block.text}</h2>
          ) : (
            <h3 key={block.id}>{block.text}</h3>
          );
        }
        if (block.type === "list") {
          const items = block.items.map((item, index) => (
            <li key={`${block.id}-${index}`}>{item}</li>
          ));
          return block.style === "numbered" ? (
            <ol key={block.id}>{items}</ol>
          ) : (
            <ul key={block.id}>{items}</ul>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={block.id}>
              <div
                className="article-body__image"
                role="img"
                aria-label={block.alt}
                style={{ backgroundImage: `url(${JSON.stringify(block.url)})` }}
              />
              {block.caption ? <figcaption>{block.caption}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === "product") {
          const product = productsById.get(block.productId);
          if (!product) return null;
          return (
            <aside className="article-product-block" key={block.id}>
              {product.imageUrl ? (
                <div
                  className="article-product-block__image"
                  role="img"
                  aria-label={product.imageAlt || product.name}
                  style={{ backgroundImage: `url(${JSON.stringify(product.imageUrl)})` }}
                />
              ) : null}
              <div>
                <p className="eyebrow">Recommended product</p>
                <h3>{product.name}</h3>
                <p>{block.note || product.shortDescription}</p>
                <Link href={`/products/${product.slug}`}>Read the recommendation</Link>
              </div>
            </aside>
          );
        }
        if (block.type === "relatedArticle") {
          const article = articlesById.get(block.articleId);
          if (!article) return null;
          return (
            <aside className="related-article-block" key={block.id}>
              <span>Continue reading</span>
              <Link href={`/guides/${article.slug}`}>
                {block.label || article.title}
              </Link>
            </aside>
          );
        }
        return null;
      })}
    </div>
  );
}
