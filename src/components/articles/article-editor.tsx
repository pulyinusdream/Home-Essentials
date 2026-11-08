"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, Eye } from "lucide-react";

import { BlockEditor } from "@/components/articles/block-editor/block-editor";
import { ProductStatus } from "@/components/products/product-status";
import type { ArticleBlock } from "@/lib/validation/article";
import {
  initialArticleActionState,
  type ArticleActionState,
} from "@/services/articles/action-state";
import {
  createArticleAction,
  updateArticleAction,
} from "@/services/articles/mutations";
import type { ArticleRow, CategoryRow } from "@/types/database.types";

type ProductChoice = {
  id: string;
  name: string;
  status: string;
};

type ArticleChoice = {
  id: string;
  title: string;
  status: string;
};

export function ArticleEditor({
  article,
  blocks,
  categories,
  products,
  articles,
}: {
  article: ArticleRow | null;
  blocks: ArticleBlock[];
  categories: Array<Pick<CategoryRow, "id" | "name" | "slug">>;
  products: ProductChoice[];
  articles: ArticleChoice[];
}) {
  const action = article
    ? updateArticleAction.bind(null, article.id)
    : createArticleAction;
  const [state, formAction, pending] = useActionState<
    ArticleActionState,
    FormData
  >(action, initialArticleActionState);
  const [dirty, setDirty] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (state.status === "error") errorRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="article-editor" onChange={() => setDirty(true)}>
      {state.status === "error" ? (
        <div className="editor-error-summary" role="alert" tabIndex={-1} ref={errorRef}>
          <AlertCircle aria-hidden="true" />
          <div>
            <h2>{state.message}</h2>
            {Object.keys(state.fieldErrors).length > 0 ? (
              <ul>
                {Object.entries(state.fieldErrors).map(([field, messages]) => (
                  <li key={field}><a href={`#article-${field}`}>{messages[0]}</a></li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="editor-section" id="article-basics">
        <header><span>01</span><div><h2>Guide details</h2><p>Give Pinterest visitors a clear promise and enough context to keep reading.</p></div></header>
        <div className="editor-section__body">
          <div className="editor-field-grid editor-field-grid--two">
            <ArticleField label="Title" name="title" error={errorFor(state, "title")} required><input id="article-title" name="title" defaultValue={article?.title ?? ""} required /></ArticleField>
            <ArticleField label="URL slug" name="slug" error={errorFor(state, "slug")} hint="Generated from the title when blank."><input id="article-slug" name="slug" defaultValue={article?.slug ?? ""} /></ArticleField>
            <ArticleField label="Category" name="categoryId" error={errorFor(state, "categoryId")}><select id="article-categoryId" name="categoryId" defaultValue={article?.category_id ?? ""}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></ArticleField>
          </div>
          <ArticleField label="Guide summary" name="excerpt" error={errorFor(state, "excerpt")} hint="This appears on guide cards and search previews."><textarea id="article-excerpt" name="excerpt" rows={4} defaultValue={article?.excerpt ?? ""} /></ArticleField>
        </div>
      </section>

      <section className="editor-section" id="article-cover">
        <header><span>02</span><div><h2>Cover image</h2><p>Use an authorized, Pinterest-friendly vertical or editorial image.</p></div></header>
        <div className="editor-section__body">
          <ArticleField label="Featured image URL" name="featuredImageUrl" error={errorFor(state, "featuredImageUrl")}><input id="article-featuredImageUrl" name="featuredImageUrl" type="url" defaultValue={article?.featured_image_url ?? ""} placeholder="https://…" /></ArticleField>
          <ArticleField label="Featured image alt text" name="featuredImageAlt" error={errorFor(state, "featuredImageAlt")}><input id="article-featuredImageAlt" name="featuredImageAlt" defaultValue={article?.featured_image_alt ?? ""} /></ArticleField>
        </div>
      </section>

      <section className="editor-section" id="article-content">
        <header><span>03</span><div><h2>Structured content</h2><p>Reorder blocks with the arrow controls. Product blocks link to your recommendation pages, not directly to checkout.</p></div></header>
        <div className="editor-section__body">
          <BlockEditor
            initialBlocks={blocks}
            products={products}
            articles={articles}
            error={errorFor(state, "content")}
            onDirty={() => setDirty(true)}
          />
        </div>
      </section>

      <section className="editor-section" id="article-seo">
        <header><span>04</span><div><h2>SEO & social</h2><p>Describe the value of the guide accurately; avoid ratings and unsupported claims.</p></div></header>
        <div className="editor-section__body">
          <div className="editor-field-grid editor-field-grid--two">
            <ArticleField label="SEO title" name="seoTitle"><input id="article-seoTitle" name="seoTitle" defaultValue={article?.seo_title ?? ""} /></ArticleField>
            <ArticleField label="Focus keyword" name="focusKeyword"><input id="article-focusKeyword" name="focusKeyword" defaultValue={article?.focus_keyword ?? ""} /></ArticleField>
          </div>
          <ArticleField label="SEO description" name="seoDescription" error={errorFor(state, "seoDescription")}><textarea id="article-seoDescription" name="seoDescription" rows={4} defaultValue={article?.seo_description ?? ""} /></ArticleField>
          <ArticleField label="Canonical URL" name="canonicalUrl"><input id="article-canonicalUrl" name="canonicalUrl" type="url" defaultValue={article?.canonical_url ?? ""} placeholder="https://…" /></ArticleField>
          <div className="editor-field-grid editor-field-grid--two">
            <ArticleField label="Social title" name="socialTitle"><input id="article-socialTitle" name="socialTitle" defaultValue={article?.social_title ?? ""} /></ArticleField>
            <ArticleField label="Social description" name="socialDescription"><textarea id="article-socialDescription" name="socialDescription" rows={3} defaultValue={article?.social_description ?? ""} /></ArticleField>
          </div>
        </div>
      </section>

      <section className="editor-section" id="article-publishing">
        <header><span>05</span><div><h2>Publishing</h2><p>Save a draft at any time. Publishing requires a cover, summary, SEO description, and at least one valid block.</p></div></header>
        <div className="editor-section__body"><div className="publishing-panel"><div><p>Current status</p><ProductStatus status={article?.status ?? "draft"} /></div><p className="article-publishing-note">Product recommendations must already be published before the guide can go live.</p></div></div>
      </section>

      <footer className="product-editor-actions article-editor-actions">
        <div>
          <span className={dirty ? "unsaved-state is-dirty" : "unsaved-state"}>{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
          {article ? <Link href={`/admin/articles/${article.id}/preview`}><Eye aria-hidden="true" /> Preview</Link> : null}
        </div>
        <div>
          <button className="editor-button editor-button--secondary" type="submit" name="intent" value="draft" disabled={pending}>{pending ? "Saving…" : "Save draft"}</button>
          <button className="editor-button editor-button--secondary" type="submit" name="intent" value="review" disabled={pending}>Send to review</button>
          <button className="editor-button editor-button--primary" type="submit" name="intent" value="publish" disabled={pending}>Publish</button>
        </div>
      </footer>
    </form>
  );
}

function ArticleField({ label, name, hint, error, required = false, children }: { label: string; name: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return <label className={error ? "editor-field has-error" : "editor-field"} htmlFor={`article-${name}`}><span>{label}{required ? <em>Required</em> : null}</span>{children}{hint ? <small>{hint}</small> : null}{error ? <span className="field-error"><AlertCircle aria-hidden="true" />{error}</span> : null}</label>;
}

function errorFor(state: ArticleActionState, field: string) {
  return state.fieldErrors[field]?.[0];
}
