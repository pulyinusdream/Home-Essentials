import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArticleEditor } from "@/components/articles/article-editor";
import { ProductStatus } from "@/components/products/product-status";
import { getArticleEditorOptions, getArticleEditorRecord } from "@/services/articles/queries";

export const metadata: Metadata = { title: "Edit buying guide", robots: { index: false, follow: false } };

export default async function EditArticlePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; duplicated?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const [record, options] = await Promise.all([getArticleEditorRecord(id), getArticleEditorOptions(id)]);
  if (!record) notFound();
  return (
    <div className="admin-page admin-page--editor">
      <header className="editor-page-header editor-page-header--status"><Link href="/admin/articles"><ArrowLeft aria-hidden="true" />Buying guides</Link><div><p className="eyebrow">Guide editor</p><h1>{record.article.title}</h1><ProductStatus status={record.article.status} /></div></header>
      {query.saved === "1" ? <p className="admin-notice" role="status">Buying guide saved successfully.</p> : null}
      {query.duplicated === "1" ? <p className="admin-notice" role="status">Duplicate created as a draft. Review every product recommendation before publishing.</p> : null}
      <ArticleEditor article={record.article} blocks={record.blocks} categories={options.categories} products={options.products} articles={options.articles} />
    </div>
  );
}
