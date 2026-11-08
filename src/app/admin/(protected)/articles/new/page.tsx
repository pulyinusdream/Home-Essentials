import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleEditor } from "@/components/articles/article-editor";
import { getArticleEditorOptions } from "@/services/articles/queries";

export const metadata: Metadata = { title: "New buying guide", robots: { index: false, follow: false } };

export default async function NewArticlePage() {
  const options = await getArticleEditorOptions();
  return (
    <div className="admin-page admin-page--editor">
      <header className="editor-page-header"><Link href="/admin/articles"><ArrowLeft aria-hidden="true" />Buying guides</Link><div><p className="eyebrow">New editorial guide</p><h1>Create a buying guide</h1><p>Answer a real household question, then connect relevant product recommendations.</p></div></header>
      <ArticleEditor article={null} blocks={[]} categories={options.categories} products={options.products} articles={options.articles} />
    </div>
  );
}
