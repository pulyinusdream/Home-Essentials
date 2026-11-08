import Link from "next/link";

import type { PublicArticleCard } from "@/services/public/repository";

export function ArticleCard({ article }: { article: PublicArticleCard }) {
  return (
    <article className="public-article-card">
      <Link href={`/guides/${article.slug}`}>
        {article.featured_image_url ? (
          <div
            className="public-article-card__image"
            role="img"
            aria-label={article.featured_image_alt || article.title}
            style={{ backgroundImage: `url(${JSON.stringify(article.featured_image_url)})` }}
          />
        ) : (
          <div className="public-article-card__image public-article-card__image--empty" aria-hidden="true" />
        )}
        <div>
          <p>{article.category?.name || "Home Essentials guide"}</p>
          <h2>{article.title}</h2>
          {article.excerpt ? <span>{article.excerpt}</span> : null}
          <strong>Read guide</strong>
        </div>
      </Link>
    </article>
  );
}
