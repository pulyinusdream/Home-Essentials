import type { Metadata } from "next";
import Link from "next/link";
import { BookPlus } from "lucide-react";

import { ArticleRowActions } from "@/components/articles/article-row-actions";
import { AdminDataTable } from "@/components/admin/data-table";
import { ProductStatus } from "@/components/products/product-status";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { listArticles } from "@/services/articles/queries";

export const metadata: Metadata = { title: "Buying guides", robots: { index: false, follow: false } };

const NOTICES: Record<string, string> = {
  "status-updated": "Buying guide status updated.",
  deleted: "Buying guide permanently deleted.",
  "publish-incomplete": "Complete the cover, summary, content, and SEO fields before publishing.",
  "product-unavailable": "Every recommended product must be published before this guide.",
  "archive-before-delete": "Archive or return the guide to draft before deleting it.",
  "duplicate-failed": "The guide could not be duplicated.",
};

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const query = await searchParams;
  const articles = await listArticles().catch(() => null);
  if (!articles) return <div className="admin-page"><ErrorState title="Buying guides could not be loaded" description="Check the Supabase connection and try again. No content was changed." /></div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--actions">
        <div><p className="eyebrow">Editorial</p><h1>Buying guides</h1><p>Create useful destination content for Pinterest visitors, then place product recommendations where they add context.</p></div>
        <Link className="admin-primary-action" href="/admin/articles/new"><BookPlus aria-hidden="true" />New guide</Link>
      </header>
      {query.notice && NOTICES[query.notice] ? <p className="admin-notice" role="status">{NOTICES[query.notice]}</p> : null}
      {articles.length === 0 ? (
        <EmptyState title="No buying guides yet" description="Start with one practical problem your reader wants to solve." action={<Link className="button button--primary" href="/admin/articles/new">Create first guide</Link>} />
      ) : (
        <AdminDataTable caption="Home Essentials buying guides" headers={["Guide", "Category", "Status", "Updated", "Actions"]}>
          {articles.map((article) => (
            <tr key={article.id}>
              <th scope="row"><Link href={`/admin/articles/${article.id}/edit`}><span>{article.title}</span><small>{article.slug}</small></Link></th>
              <td>{article.category?.name ?? "Uncategorized"}</td>
              <td><ProductStatus status={article.status} /></td>
              <td><time dateTime={article.updated_at}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(article.updated_at))}</time></td>
              <td><ArticleRowActions id={article.id} status={article.status} /></td>
            </tr>
          ))}
        </AdminDataTable>
      )}
    </div>
  );
}
