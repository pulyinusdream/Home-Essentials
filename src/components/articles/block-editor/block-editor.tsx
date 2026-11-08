"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Heading2,
  ImageIcon,
  Link2,
  List,
  PackageSearch,
  Pilcrow,
  Trash2,
} from "lucide-react";

import type { ArticleBlock } from "@/lib/validation/article";
import { moveArticleBlock } from "@/services/articles/workflow";

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

export function BlockEditor({
  initialBlocks,
  products,
  articles,
  error,
  onDirty,
}: {
  initialBlocks: ArticleBlock[];
  products: ProductChoice[];
  articles: ArticleChoice[];
  error?: string;
  onDirty?: () => void;
}) {
  const [blocks, setBlocks] = useState(initialBlocks);

  function addBlock(type: ArticleBlock["type"]) {
    const id = crypto.randomUUID();
    const next: ArticleBlock | null =
      type === "paragraph"
        ? { id, type, text: "" }
        : type === "heading"
          ? { id, type, level: 2, text: "" }
          : type === "list"
            ? { id, type, style: "bulleted", items: [""] }
            : type === "image"
              ? { id, type, url: "", alt: "", caption: "" }
              : type === "product" && products[0]
                ? { id, type, productId: products[0].id, note: "" }
                : type === "relatedArticle" && articles[0]
                  ? { id, type, articleId: articles[0].id, label: "" }
                  : null;
    if (next) {
      onDirty?.();
      setBlocks((current) => [...current, next]);
    }
  }

  function updateBlock(id: string, next: ArticleBlock) {
    onDirty?.();
    setBlocks((current) => current.map((block) => (block.id === id ? next : block)));
  }

  return (
    <div className={error ? "block-editor has-error" : "block-editor"}>
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      <div className="block-editor-toolbar" aria-label="Add content block">
        <span>Add block</span>
        <button type="button" onClick={() => addBlock("paragraph")}><Pilcrow aria-hidden="true" />Paragraph</button>
        <button type="button" onClick={() => addBlock("heading")}><Heading2 aria-hidden="true" />Heading</button>
        <button type="button" onClick={() => addBlock("list")}><List aria-hidden="true" />List</button>
        <button type="button" onClick={() => addBlock("image")}><ImageIcon aria-hidden="true" />Image</button>
        <button type="button" onClick={() => addBlock("product")} disabled={products.length === 0}><PackageSearch aria-hidden="true" />Product</button>
        <button type="button" onClick={() => addBlock("relatedArticle")} disabled={articles.length === 0}><Link2 aria-hidden="true" />Related guide</button>
      </div>

      {error ? <p className="field-error">{error}</p> : null}

      <div className="block-editor-list">
        {blocks.length === 0 ? (
          <div className="block-editor-empty">
            <h3>Build a useful guide, one block at a time.</h3>
            <p>Start with a paragraph or heading. Add product recommendations only where they help the reader.</p>
          </div>
        ) : null}
        {blocks.map((block, index) => (
          <article className="content-block-card" key={block.id}>
            <header>
              <div><span>{String(index + 1).padStart(2, "0")}</span><strong>{blockLabel(block.type)}</strong></div>
              <div className="content-block-controls">
                <button type="button" aria-label={`Move ${blockLabel(block.type)} up`} disabled={index === 0} onClick={() => { onDirty?.(); setBlocks((current) => moveArticleBlock(current, block.id, "up")); }}><ArrowUp aria-hidden="true" /></button>
                <button type="button" aria-label={`Move ${blockLabel(block.type)} down`} disabled={index === blocks.length - 1} onClick={() => { onDirty?.(); setBlocks((current) => moveArticleBlock(current, block.id, "down")); }}><ArrowDown aria-hidden="true" /></button>
                <button type="button" aria-label={`Remove ${blockLabel(block.type)}`} className="is-destructive" onClick={() => { onDirty?.(); setBlocks((current) => current.filter((item) => item.id !== block.id)); }}><Trash2 aria-hidden="true" /></button>
              </div>
            </header>
            <div className="content-block-card__body">
              {block.type === "paragraph" ? (
                <label><span>Paragraph text</span><textarea rows={5} value={block.text} onChange={(event) => updateBlock(block.id, { ...block, text: event.target.value })} /></label>
              ) : null}
              {block.type === "heading" ? (
                <div className="block-inline-fields">
                  <label><span>Level</span><select value={block.level} onChange={(event) => updateBlock(block.id, { ...block, level: Number(event.target.value) as 2 | 3 })}><option value={2}>Heading 2</option><option value={3}>Heading 3</option></select></label>
                  <label><span>Heading text</span><input value={block.text} onChange={(event) => updateBlock(block.id, { ...block, text: event.target.value })} /></label>
                </div>
              ) : null}
              {block.type === "list" ? (
                <div className="block-inline-fields">
                  <label><span>List style</span><select value={block.style} onChange={(event) => updateBlock(block.id, { ...block, style: event.target.value as "bulleted" | "numbered" })}><option value="bulleted">Bulleted</option><option value="numbered">Numbered</option></select></label>
                  <label><span>Items, one per line</span><textarea rows={5} value={block.items.join("\n")} onChange={(event) => updateBlock(block.id, { ...block, items: event.target.value.split("\n") })} /></label>
                </div>
              ) : null}
              {block.type === "image" ? (
                <div className="block-stack-fields">
                  <label><span>Image URL</span><input type="url" value={block.url} placeholder="https://…" onChange={(event) => updateBlock(block.id, { ...block, url: event.target.value })} /></label>
                  <label><span>Alt text</span><input value={block.alt} onChange={(event) => updateBlock(block.id, { ...block, alt: event.target.value })} /></label>
                  <label><span>Caption</span><input value={block.caption} onChange={(event) => updateBlock(block.id, { ...block, caption: event.target.value })} /></label>
                </div>
              ) : null}
              {block.type === "product" ? (
                <div className="block-stack-fields">
                  <label><span>Recommended product</span><select value={block.productId} onChange={(event) => updateBlock(block.id, { ...block, productId: event.target.value })}>{products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.status}</option>)}</select></label>
                  <label><span>Editorial note</span><textarea rows={3} value={block.note} onChange={(event) => updateBlock(block.id, { ...block, note: event.target.value })} /></label>
                </div>
              ) : null}
              {block.type === "relatedArticle" ? (
                <div className="block-stack-fields">
                  <label><span>Related guide</span><select value={block.articleId} onChange={(event) => updateBlock(block.id, { ...block, articleId: event.target.value })}>{articles.map((article) => <option key={article.id} value={article.id}>{article.title} — {article.status}</option>)}</select></label>
                  <label><span>Optional link label</span><input value={block.label} onChange={(event) => updateBlock(block.id, { ...block, label: event.target.value })} /></label>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function blockLabel(type: ArticleBlock["type"]) {
  return {
    paragraph: "Paragraph",
    heading: "Heading",
    list: "List",
    image: "Image",
    product: "Product recommendation",
    relatedArticle: "Related guide",
  }[type];
}
